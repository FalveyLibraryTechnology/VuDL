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
            "dc:subject": "subject"
        };


        for (let field of dc.children) {
            switch (field.name) {
                case "dc:date":
                    fields.date = field.value;
                    break;
                case "dc:creator":
                    fields.creator = field.value;
                    break;
                case "dc:language":
                    fields.language = field.value;
                    break;
                case "dc:relation":
                    fields.relation = field.value;
                    break;
                case "dc:source":
                    fields.source = field.value;
                    break;
                case "dc:collection":
                    fields.collection = field.value;
                    break;
                case "dc:format":
                    fields.format = field.value;
                    break;
                default:
                    if (typeof fieldMap[field.name] != "undefined") {
                        fields[fieldMap[field.name]] = field.value; 
                    }
                    break;
            }
    }

        return fields;
    }
}

export default SolrIndexer;