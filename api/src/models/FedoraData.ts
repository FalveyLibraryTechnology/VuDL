class FedoraData {
    public metadata: Record<string, Array<string>>;
    public pid: string;
    public relations: Record<string, Array<string>>;
    public fedoraDetails: Record<string, Array<string>>;
    public fedoraDatastreams: Array<string>;
    protected extraDetails: Record<string, Record<string, Array<string>>>;
    protected parents: Array<FedoraData> = [];

    constructor(
        pid: string,
        relations: Record<string, Array<string>>,
        metadata: Record<string, Array<string>>,
        fedoraDetails: Record<string, Array<string>>,
        fedoraDatastreams: Array<string>,
        extraDetails: Record<string, Record<string, Array<string>>>
    ) {
        this.pid = pid;
        this.relations = relations;
        this.metadata = metadata;
        this.fedoraDetails = fedoraDetails;
        this.fedoraDatastreams = fedoraDatastreams;
        this.extraDetails = extraDetails;
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

    getThumbnailHash(type: string): string {
        const hashes =
            typeof this.extraDetails.thumbnails === "undefined"
                ? []
                : this.extraDetails.thumbnails.hasMessageDigest ?? [];
        for (const hash of hashes) {
            const parts = hash.split(":");
            if ((parts[1] ?? "") === type && typeof parts[2] !== "undefined") {
                return parts[2];
            }
        }
        return null;
    }

    get agents(): Record<string, Array<string>> {
        return typeof this.extraDetails.agents === "undefined" ? {} : this.extraDetails.agents;
    }

    get license(): string {
        return typeof this.extraDetails.license === "undefined" ? null : this.extraDetails.license.url[0];
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
        return (this.metadata["dc:title"] ?? [])[0] ?? "";
    }
}

export default FedoraData;
