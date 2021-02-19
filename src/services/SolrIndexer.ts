import Fedora from './Fedora';

class SolrIndexer {
    fedora: Fedora;

    constructor() {
        // TODO: Config
        // TODO: Make Fedora connection
        this.fedora = new Fedora();
    }

    async getFields(pid: string) {
        // TODO: Use Fedora to get data
        let dc = this.fedora.getDC(pid);
        console.log("SI:then");
        return dc;
    }
}

export default SolrIndexer;