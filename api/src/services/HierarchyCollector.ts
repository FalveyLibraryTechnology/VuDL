import Fedora from "./Fedora";
import FedoraData from "../models/FedoraData";
import { DOMParser } from "xmldom";
import { resourceLimits } from "node:worker_threads";
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

    async getHierarchy(pid): Promise<FedoraData> {
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
            "fedora-rels-ext": "info:fedora/fedora-system:def/relations-external#",
            "vudl-rel": "http://vudl.org/relationships#",
        });
        let models = rdfXPath(
            "//fedora-model:hasModel/@rdf:resource",
            RELS_XML
        ).map((resource) => {
            return resource.nodeValue.substr("info:fedora/".length);
        });
        let sequences = rdfXPath(
            '//vudl-rel:sequence', RELS_XML
        ).map((sequence) => {
            return sequence.nodeValue;
        });
        let result = new FedoraData(pid, models, sequences, DC.children);
        let parentList = rdfXPath(
            "//fedora-rels-ext:isMemberOf/@rdf:resource",
            RELS_XML
        );
        // Create promises to retrieve parents asynchronously...
        let promises = parentList.map(async (resource) => {
            let parentPid = resource.nodeValue.substr("info:fedora/".length);
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