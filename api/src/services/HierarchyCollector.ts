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

    protected extractMetadata(DC: any): {[key: string]: Array<string>} {
        let metadata: {[key: string]: Array<string>} = {};
        DC.children.forEach((field) => {
            if (typeof metadata[field.name] === "undefined") {
                metadata[field.name] = [];
            }
            metadata[field.name].push(field.value);
        });
        return metadata;
    }

    protected extractRDFXML(xml, namespaces, xpathQuery) {
        let rdfXPath = xpath.useNamespaces(namespaces);
        let relations: {[key: string]: Array<string>} = {};
        rdfXPath(xpathQuery, xml).forEach((relation) => {
            let values = rdfXPath('text()', relation);
            // If there's a namespace on the node name, strip it:
            let nodeName = relation.nodeName.split(':').pop();
            if (values.length === 0) {
                values = rdfXPath('./@rdf:resource', relation);
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

    async getHierarchy(pid, fetchRdf: boolean = true): Promise<FedoraData> {
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
        let result = new FedoraData(
            pid, this.extractRelations(RELS), this.extractMetadata(DC),
            fetchRdf ? this.extractFedoraDetails(RDF) : {},
            fetchRdf ? this.extractFedoraDatastreams(RDF) : []
        );
        // Create promises to retrieve parents asynchronously...
        let promises = (result.relations.isMemberOf ?? []).map(async (resource) => {
            let parentPid = resource.substr("info:fedora/".length);
            if (!this.hierarchyTops.includes(parentPid)) {
                // The "false" here skips RDF retrieval:
                let parent = await this.getHierarchy(parentPid, false);
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