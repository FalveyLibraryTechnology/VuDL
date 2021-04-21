import Fedora from "./Fedora";
import FedoraData from "../models/FedoraData";
import { DOMParser } from "xmldom";
const xpath = require("xpath");

class HierarchyCollector {
    fedora: Fedora;
    // PIDs that define the top of a hierarchy. Typically this
    // includes the overall top PID, plus the top public PID.
    hierarchyTops: Array<string>;

    constructor(fedora: Fedora, hierarchyTops: Array<string>) {
        this.fedora = fedora;
        this.hierarchyTops = hierarchyTops;
    }

    protected extractRelations(RELS: string): {[key: string]: Array<string>} {
        let xmlParser = new DOMParser();
        let RELS_XML = xmlParser.parseFromString(RELS, "text/xml");
        let rdfXPath = xpath.useNamespaces({
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        });
        let relations: {[key: string]: Array<string>} = {};
        rdfXPath(
            '//rdf:Description/*', RELS_XML
        ).forEach((relation) => {
            let values = rdfXPath('text()', relation);
            if (values.length === 0) {
                values = rdfXPath('./@rdf:resource', relation);
            }
            if (values.length > 0) {
                if (typeof relations[relation.nodeName] === "undefined") {
                    relations[relation.nodeName] = [];
                }
                relations[relation.nodeName].push(values[0].nodeValue);
            }
        });
        return relations;
    }

    async getHierarchy(pid): Promise<FedoraData> {
        // Use Fedora to get data
        // TODO: type
        // TODO: catch failure
        // TODO: Launch promises together, Promise.all()
        const DC = await this.fedora.getDC(pid);
        const RELS = await this.fedora.getDatastream(pid, "RELS-EXT");
        let relations = this.extractRelations(RELS);
        let result = new FedoraData(pid, relations, DC.children);
        // Create promises to retrieve parents asynchronously...
        let promises = (relations.isMemberOf ?? []).map(async (resource) => {
            let parentPid = resource.substr("info:fedora/".length);
            if (!this.hierarchyTops.includes(parentPid)) {
                let parent = await this.getHierarchy(parentPid);
                result.addParent(parent);
            }
        });
        // Now wait for the promises to complete before we return results, so
        // nothing happens out of order.
        await Promise.all(promises);
        return result;
    }
}

export default HierarchyCollector;