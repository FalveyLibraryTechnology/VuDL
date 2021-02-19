import Fedora from './Fedora';

class SolrIndexer {
    fedora: Fedora;

    constructor() {
        // TODO: Config
        // Make Fedora connection
        this.fedora = new Fedora();
    }

    async getFields(pid: string) {
        // Use Fedora to get data
        // TODO: type
        let dc = await this.fedora.getDC(pid);

        // Massage data
        let fields: any = {};
        // TODO: Pull from config
        let fieldMap = {
            "dc:identifier": "id",
            "dc:title": "title",
        };
        for (let field of dc.children) {
            if (typeof fieldMap[field.name] != "undefined") {
                fields[fieldMap[field.name]] = field.value;
            }
        }

        return fields;
    }
}

export default SolrIndexer;