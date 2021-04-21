class FedoraData {
    public pid: string;
    // TODO: better typing
    public allMetadata: Array<any>;
    parents: Array<FedoraData> = [];

    constructor (pid: string, dc_data: Array<any>) {
        this.pid = pid;
        this.allMetadata = dc_data;
    }

    addParent(parent: FedoraData): void {
        this.parents.push(parent);
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