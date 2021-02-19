class SolrIndexer{

    constructor() {
        // TODO: Config
        // TODO: Make Fedora connection
    }

    getFields(pid: string) {
        // TODO: Use Fedora to get data
        let fields: any = {
            id: pid
        };
        return fields;
    }
}

export default SolrIndexer;