import Fedora from './Fedora';

interface SolrFields {
    [key: string]: string;
}

class SolrIndexer {
    fedora: Fedora;

    constructor() {
        // TODO: Config
        // Make Fedora connection
        this.fedora = new Fedora();
    }

    async getFields(pid: string): Promise<SolrFields> {
        // Use Fedora to get data
        // TODO: type
        // TODO: catch failure
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
                    let mapped = fieldMap[field.name];
                    if (typeof mapped == "undefined") {
                        console.error("No map for field: " + field.name);
                        break;
                    }
                    switch (typeof fields[mapped]) {
                        case "undefined": // No value yet
                            fields[mapped] = field.value;
                            break;
                        case "string": // Convert from single to multi-value
                            fields[mapped] = [fields[mapped], field.value];
                            break;
                        case "object": // Array
                            fields[mapped].push(field.value);
                            break;
                    }
            }
    }

        return fields;
    }
}

export default SolrIndexer;