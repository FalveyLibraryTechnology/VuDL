import Fedora from "./Fedora";
import FedoraData from "../models/FedoraData";
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

        // Start with basic data:
        let fields: any = {
            modeltype_str_mv: fedoraData.models,
            hierarchytype: null,
            hierarchy_all_parents_str_mv: fedoraData.getAllParents()
        };

        // Is this a hierarchy?
        if (fedoraData.models.includes('vudl-system:FolderCollection')) {
            fields.is_hierarchy_id = fedoraData.pid;
            fields.is_hierarchy_title = fedoraData.title;
        }

        // Add sequence/order data:
        for (let sequence of fedoraData.sequences) {
            let sequence_str = 'TODO';
            let dynamic_sequence_field_name = 'sequence_' + sequence_str + '_str';
            fields[dynamic_sequence_field_name] = 'TODO';
        }
        fields.has_order_str = 'TODO';

        // Process parent data:
        let hierarchyParents: Array<FedoraData> = [];
        let hierarchySequences: Array<string> = [];
        for (let parent of fedoraData.parents) {
            // If the object is a Data, the parentPID is the Resource it belongs
            // to (skip the List object):
            if (fedoraData.models.includes('vudl-system:DataModel')) {
                hierarchyParents = hierarchyParents.concat(parent.parents);
            } else {
                // ...else it is the immediate parent (Folder most likely):
                hierarchyParents.push(parent);
            }

            // TODO: fill in hierarchySequences.
        }
        var hierarchyTops: Array<FedoraData> = fedoraData.getAllHierarchyTops();
        if (hierarchyTops.length > 0) {
            fields.hierarchy_top_id = [];
            fields.hierarchy_top_title = [];
            for (let top of hierarchyTops) {
                if (!fields.hierarchy_top_id.includes(top.pid)) {
                    fields.hierarchy_top_id.push(top.pid);
                    fields.hierarchy_top_title.push(top.title);
                }
            }
        }
        if (hierarchyParents.length > 0) {
            fields.hierarchy_first_parent_id_str = hierarchyParents[0].pid;
            fields.hierarchy_browse = [];
            fields.hierarchy_parent_id = [];
            fields.hierarchy_parent_title = [];
            for (let parent of hierarchyParents) {
                if (!fields.hierarchy_parent_id.includes(parent.pid)) {
                    fields.hierarchy_browse.push(parent.title + "{{{_ID_}}}" + parent.pid);
                    fields.hierarchy_parent_id.push(parent.pid);
                    fields.hierarchy_parent_title.push(parent.title);
                }
            }
        }
        if (hierarchySequences.length > 0) {
            // TODO: populate hierarchy_sequence_sort_str
            fields.hierarchy_sequence = hierarchySequences;
        }

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
