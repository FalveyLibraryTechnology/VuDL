class FedoraData {
    public pid: string;
    public title: string;
    parents: Array<FedoraData> = [];

    constructor (pid: string, title: string) {
        this.pid = pid;
        this.title = title;
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
}

export default FedoraData;