class FedoraObject {
    public pid: string;

    constructor(pid: string) {
        this.pid = pid;
    }

    get sort() {
        // TODO: fetch sort value from RELS-EXT or equivalent, instead of hard-coding
        return "title";
    }
}
export default FedoraObject;
