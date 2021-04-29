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

    protected extractRDFXML(xml, namespaces, xpathQuery) {
        const rdfXPath = xpath.useNamespaces(namespaces);
        const relations: Record<string, Array<string>> = {};
        rdfXPath(xpathQuery, xml).forEach((relation: Node) => {
            let values = rdfXPath('text()', relation) as Array<Node>;
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

    protected extractRelations(RELS: string): {[key: string]: Array<string>} {
        let xmlParser = new DOMParser();
        let RELS_XML = xmlParser.parseFromString(RELS, "text/xml");
        return this.extractRDFXML(
            RELS_XML,
            {
                rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            },
            '//rdf:Description/*'
        );
    }

    protected extractFedoraDetails(RDF: string): {[key: string]: Array<string>} {
        let xmlParser = new DOMParser();
        let RDF_XML = xmlParser.parseFromString(RDF, "text/xml");
        return this.extractRDFXML(
            RDF_XML,
            {
                'rdf': "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                'fedora3-model': "info:fedora/fedora-system:def/model#",
                'fedora3-view': "info:fedora/fedora-system:def/view#",
            },
            '//rdf:Description/fedora3-model:*|//rdf:Description/fedora3-view:*'
        );
    }

    protected extractFedoraDatastreams(RDF: string): Array<string> {
        let xmlParser = new DOMParser();
        let RDF_XML = xmlParser.parseFromString(RDF, "text/xml");
        return this.extractRDFXML(
            RDF_XML,
            {
                'rdf': "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                'ldp': "http://www.w3.org/ns/ldp#",
            },
            '//ldp:contains'
        )['contains'] ?? [];
    }

    async getHierarchy(pid: string, fetchRdf = true): Promise<FedoraData> {
        // Use Fedora to get data
        // TODO: type
        // TODO: catch failure
        // TODO: Launch promises together, Promise.all()
        const DC = await this.fedora.getDC(pid);
        const RELS = await this.fedora.getDatastream(pid, "RELS-EXT");
        // For indexing purposes, we only need the RDF information for the
        // first object retrieved; so when we recurse higher into the tree,
        // we can skip fetching more RDF in order to save some time!
        const RDF = fetchRdf ? await this.fedora.getRdf(pid) : null;
        const result = new FedoraData(
            pid, this.extractRelations(RELS), this.extractMetadata(DC),
            fetchRdf ? this.extractFedoraDetails(RDF) : {},
            fetchRdf ? this.extractFedoraDatastreams(RDF) : []
        );
        // Create promises to retrieve parents asynchronously...
        const promises = (result.relations.isMemberOf ?? []).map(async (resource) => {
            const parentPid = resource.substr("info:fedora/".length);
            if (!this.hierarchyTops.includes(parentPid)) {
                // The "false" here skips RDF retrieval:
                const parent = await this.getHierarchy(parentPid, false);
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
