import Fedora from './Fedora';

class SolrIndexer {
    fedora: Fedora;

    constructor() {
        // TODO: Config
        // TODO: Make Fedora connection
        this.fedora = new Fedora();
    }

    getFields(pid: string) {
        // TODO: Use Fedora to get data
        return new Promise((done, fail) => {
            this.fedora.getDC(pid)
                .then(function getFieldsDC(dc) {
                    console.log("SI:then");
                    done(dc);
                });
        });
    }
}

export default SolrIndexer;