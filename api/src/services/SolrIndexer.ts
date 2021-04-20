import Fedora from "./Fedora";
import HierarchyCollector from "./HierarchyCollector";
import { DOMParser } from "xmldom";
const xpath = require("xpath");

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
        // TODO: Launch promises together, Promise.all()
        const DC = await this.fedora.getDC(pid);
        const RELS = await this.fedora.getDatastream(pid, "RELS-EXT");
        let xmlParser = new DOMParser();
        let RELS_XML = xmlParser.parseFromString(RELS, "text/xml");
        let rdfXPath = xpath.useNamespaces({
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "fedora-model": "info:fedora/fedora-system:def/model#",
        });

        // Collect hierarchy data
        let hierarchyCollector = new HierarchyCollector(this.fedora);
        let hierarchyCollection = await hierarchyCollector.getHierarchy(pid);

        // Massage data
        let fields: any = {
            modeltype_str_mv: rdfXPath(
                "//fedora-model:hasModel/@rdf:resource",
                RELS_XML
            ).map((resource) => {
                return resource.nodeValue.substr("info:fedora/".length);
            }),
            hierarchy_all_parents_str_mv: hierarchyCollection.getAllParents()
        };

        // TODO: Pull from config
        let fieldMap = {
            "dc:identifier": "id",
            "dc:title": "title",
            "dc:subject": "subject",
        };

        for (let field of DC.children) {
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
