import Fedora from "./Fedora";
import FedoraData from "./FedoraData";
import { DOMParser } from "xmldom";
import { resourceLimits } from "node:worker_threads";
const xpath = require("xpath");

class HierarchyCollector {
    fedora: Fedora;

    constructor(fedora: Fedora) {
        this.fedora = fedora;
    }

    async getHierarchy(pid): Promise<FedoraData> {
        const DC = await this.fedora.getDC(pid);
        const RELS = await this.fedora.getDatastream(pid, "RELS-EXT");
        let xmlParser = new DOMParser();
        let RELS_XML = xmlParser.parseFromString(RELS, "text/xml");
        let rdfXPath = xpath.useNamespaces({
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "fedora-rels-ext": "info:fedora/fedora-system:def/relations-external#",
        });
        let title = "";
        for (let field of DC.children) {
            if (field.name === 'dc:title') {
                title = field.value;
            }
        };
        let result = new FedoraData(pid, title);
        let parentList = rdfXPath(
            "//fedora-rels-ext:isMemberOf/@rdf:resource",
            RELS_XML
        );
        // Create promises to retrieve parents asynchronously...
        let promises = parentList.map(async (resource) => {
            let parent = await this.getHierarchy(resource.nodeValue.substr("info:fedora/".length));
            result.addParent(parent);
        });
        // Now wait for the promises to complete before we return results, so
        // nothing happens out of order.
        await Promise.all(promises);
        return result;
    }
}

export default HierarchyCollector;