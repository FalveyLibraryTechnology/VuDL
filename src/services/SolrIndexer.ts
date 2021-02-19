class SolrIndexer{

    constructor(pid) {
        //T
    }

    getFields(pid){
        let fields: any = {
            id: pid
        };
        return fields;
    }
}

export default SolrIndexer;