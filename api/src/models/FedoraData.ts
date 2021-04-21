class FedoraData {
    // TODO: better typing
    public allMetadata: Array<any>;
    public models: Array<string>;
    public pid: string;
    public sequences: Array<string>;
    parents: Array<FedoraData> = [];

    constructor (pid: string, models: Array<string>, sequences: Array<string>, dc_data: Array<any>) {
        this.pid = pid;
        this.models = models;
        this.sequences = sequences;
        this.allMetadata = dc_data ?? [];
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

    get title() {
        for (let field of this.allMetadata) {
            if (field.name === 'dc:title') {
                return field.value;
            }
        };
        return '';
    }
}

export default FedoraData;