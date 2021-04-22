class FedoraData {
    public metadata: {[key: string]: Array<string>};
    public pid: string;
    public relations: {[key: string]: Array<string>};
    parents: Array<FedoraData> = [];

    constructor (
        pid: string,
        relations: {[key: string]: Array<string>},
        metadata: {[key: string]: Array<string>}
    ) {
        this.pid = pid;
        this.relations = relations;
        this.metadata = metadata;
    }

    addParent(parent: FedoraData): void {
        this.parents.push(parent);
    }

    getAllHierarchyTops(): Array<FedoraData> {
        // If we have no parents, we ARE the top:
        if (this.parents.length === 0) {
            return [this];
        }

        // Otherwise, let's collect data from our parents:
        let tops: Array<FedoraData> = [];
        for (let parent of this.parents) {
            for (let top of parent.getAllHierarchyTops()) {
                if (!tops.includes(top)) {
                    tops.push(top);
                }
            }
        }
        return tops;
    }

    getAllParents(): Array<string> {
        let results = [];
        this.parents.forEach((parent) => {
            let parentPids = [parent.pid].concat(parent.getAllParents());
            parentPids.forEach((pid) => {
                if (!results.includes(pid)) {
                    results.push(pid);
                }
            });
        });
        return results;
    }

    get models() {
        // Strip off "info:fedora/" prefix:
        return (this.relations.hasModel ?? []).map((model) => {
            return model.substr("info:fedora/".length);
        });
    }

    get sequences() {
        return this.relations.sequence ?? [];
    }

    get title() {
        return typeof(this.metadata['dc:title']) !== "undefined"
            ? this.metadata['dc:title'][0] : '';
    }
}

export default FedoraData;