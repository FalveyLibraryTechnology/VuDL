class FedoraData {
    public metadata: Record<string, string>;
    public pid: string;
    public relations: Record<string, string>;
    parents: Array<FedoraData> = [];

    constructor(pid: string, relations: Record<string, string>, metadata: Record<string, string>) {
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
        const tops: Array<FedoraData> = [];
        for (const parent of this.parents) {
            for (const top of parent.getAllHierarchyTops()) {
                if (!tops.includes(top)) {
                    tops.push(top);
                }
            }
        }
        return tops;
    }

    getAllParents(): Array<string> {
        const results = [];
        this.parents.forEach((parent) => {
            const parentPids = [parent.pid].concat(parent.getAllParents());
            parentPids.forEach((pid) => {
                if (!results.includes(pid)) {
                    results.push(pid);
                }
            });
        });
        return results;
    }

    get models(): Array<string> {
        // Strip off "info:fedora/" prefix:
        return (this.relations.hasModel ?? []).map((model) => {
            return model.substr("info:fedora/".length);
        });
    }

    get sequences(): Array<string> {
        return this.relations.sequence ?? [];
    }

    get title(): string {
        return typeof this.metadata["dc:title"] !== "undefined" ? this.metadata["dc:title"][0] : "";
    }
}

export default FedoraData;
