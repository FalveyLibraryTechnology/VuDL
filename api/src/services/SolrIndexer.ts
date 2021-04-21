import Fedora from "./Fedora";
import HierarchyCollector from "./HierarchyCollector";
const xpath = require("xpath");

interface SolrFields {
    [key: string]: string;
}

class SolrIndexer {
    hierarchyCollector: HierarchyCollector;

    constructor() {
        // Make Fedora connection
        let fedora = new Fedora();
        // TODO: make configurable
        let topPids = ["vudl:1", "vudl:3"];
        this.hierarchyCollector = new HierarchyCollector(fedora, topPids);
    }

    async getFields(pid: string): Promise<SolrFields> {
        // Collect hierarchy data
        let fedoraData = await this.hierarchyCollector.getHierarchy(pid);

        // Massage data
        let fields: any = {
            modeltype_str_mv: fedoraData.models,
            hierarchy_all_parents_str_mv: fedoraData.getAllParents()
        };

        // TODO: Pull from config
        let fieldMap = {
            "dc:identifier": "id",
            "dc:title": "title",
            "dc:subject": "subject",
        };

        for (let field of fedoraData.allMetadata) {
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
