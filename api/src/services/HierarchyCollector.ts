import { DC, Fedora } from "./Fedora";
import FedoraData from "../models/FedoraData";
import { DOMParser } from "xmldom";
import xpath = require("xpath");

class HierarchyCollector {
    fedora: Fedora;
    // PIDs that define the top of a hierarchy. Typically this
    // includes the overall top PID, plus the top public PID.
    hierarchyTops: Array<string>;

    constructor(fedora: Fedora, hierarchyTops: Array<string>) {
        this.fedora = fedora;
        this.hierarchyTops = hierarchyTops;
    }

    protected extractMetadata(dc: DC): Record<string, Array<string>> {
        const metadata: { [key: string]: Array<string> } = {};
        dc.children.forEach((field) => {
            if (typeof metadata[field.name] === "undefined") {
                metadata[field.name] = [];
            }
            metadata[field.name].push(field.value);
        });
        return metadata;
    }

    protected extractRelations(RELS: string): Record<string, Array<string>> {
        const xmlParser = new DOMParser();
        const RELS_XML = xmlParser.parseFromString(RELS, "text/xml");
        const rdfXPath = xpath.useNamespaces({
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        });
        const relations: Record<string, Array<string>> = {};
        rdfXPath("//rdf:Description/*", RELS_XML).forEach((relation: Node) => {
            let values = rdfXPath("text()", relation) as Array<Node>;
            // If there's a namespace on the node name, strip it:
            const nodeName = relation.nodeName.split(":").pop();
            if (values.length === 0) {
                values = rdfXPath("./@rdf:resource", relation) as Array<Node>;
            }
            if (values.length > 0) {
                if (typeof relations[nodeName] === "undefined") {
                    relations[nodeName] = [];
                }
                relations[nodeName].push(values[0].nodeValue);
            }
        });
        return relations;
    }

    async getHierarchy(pid: string): Promise<FedoraData> {
        // Use Fedora to get data
        // TODO: type
        // TODO: catch failure
        // TODO: Launch promises together, Promise.all()
        const DC = await this.fedora.getDC(pid);
        const RELS = await this.fedora.getDatastream(pid, "RELS-EXT");
        const result = new FedoraData(pid, this.extractRelations(RELS), this.extractMetadata(DC));
        // Create promises to retrieve parents asynchronously...
        const promises = (result.relations.isMemberOf ?? []).map(async (resource) => {
            const parentPid = resource.substr("info:fedora/".length);
            if (!this.hierarchyTops.includes(parentPid)) {
                const parent = await this.getHierarchy(parentPid);
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
