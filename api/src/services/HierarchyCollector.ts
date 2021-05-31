import { DC, Fedora } from "./Fedora";
import FedoraData from "../models/FedoraData";
import { DOMParser } from "xmldom";
import xpath = require("xpath");
import TikaExtractor from "./TikaExtractor";

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
        if (typeof dc.children === "undefined") {
            throw "Unexpected failure: childless Dublin Core!";
        }
        const metadata: Record<string, Array<string>> = {};
        dc.children.forEach((field) => {
            if (typeof metadata[field.name] === "undefined") {
                metadata[field.name] = [];
            }
            metadata[field.name].push(field.value);
        });
        return metadata;
    }

    protected extractRDFXML(
        xml: DOMParser.Dom,
        namespaces: Record<string, string>,
        xpathQuery: string
    ): Record<string, Array<string>> {
        const rdfXPath = xpath.useNamespaces(namespaces);
        const relations: Record<string, Array<string>> = {};
        rdfXPath(xpathQuery, xml).forEach((relation: Node) => {
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

    protected extractRelations(RELS: string): Record<string, Array<string>> {
        const xmlParser = new DOMParser();
        const RELS_XML = xmlParser.parseFromString(RELS, "text/xml");
        return this.extractRDFXML(
            RELS_XML,
            {
                rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            },
            "//rdf:Description/*"
        );
    }

    protected extractFedoraDetails(RDF: string): Record<string, Array<string>> {
        const xmlParser = new DOMParser();
        const RDF_XML = xmlParser.parseFromString(RDF, "text/xml");
        return this.extractRDFXML(
            RDF_XML,
            {
                rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                "fedora3-model": "info:fedora/fedora-system:def/model#",
                "fedora3-view": "info:fedora/fedora-system:def/view#",
            },
            "//rdf:Description/fedora3-model:*|//rdf:Description/fedora3-view:*"
        );
    }

    protected extractFedoraDatastreams(RDF: string): Array<string> {
        const xmlParser = new DOMParser();
        const RDF_XML = xmlParser.parseFromString(RDF, "text/xml");
        const raw =
            this.extractRDFXML(
                RDF_XML,
                {
                    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                    ldp: "http://www.w3.org/ns/ldp#",
                },
                "//ldp:contains"
            )["contains"] ?? [];
        return raw.map((ds) => {
            return ds.split("/").pop();
        });
    }

    protected extractLicense(XML: string): string {
        const xmlParser = new DOMParser();
        const parsedXml = xmlParser.parseFromString(XML, "text/xml");
        const namespaces = {
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            METS: "http://www.loc.gov/METS/",
            xlink: "http://www.w3.org/1999/xlink",
        };
        const rdfXPath = xpath.useNamespaces(namespaces);
        let license = null;
        rdfXPath("//@xlink:href", parsedXml).forEach((relation: Node) => {
            license = relation.nodeValue;
        });
        return license;
    }

    protected extractAgents(xml: string): Record<string, Array<string>> {
        const xmlParser = new DOMParser();
        const RDF_XML = xmlParser.parseFromString(xml, "text/xml");
        return this.extractRDFXML(
            RDF_XML,
            {
                rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                METS: "http://www.loc.gov/METS/",
            },
            "//METS:agent/*"
        );
    }

    protected extractFitsData(xml: string): Record<string, Array<string>> {
        const xmlParser = new DOMParser();
        const RDF_XML = xmlParser.parseFromString(xml, "text/xml");
        const namespaces = {
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            fits: "http://hul.harvard.edu/ois/xml/ns/fits/fits_output",
        };
        const details = this.extractRDFXML(
            RDF_XML,
            namespaces,
            "//fits:fileinfo/fits:size|//fits:imageWidth|//fits:imageHeight"
        );
        details.mimetype = [];
        const fitsXPath = xpath.useNamespaces(namespaces);
        fitsXPath("//fits:identity/@mimetype", RDF_XML).forEach((relation: Node) => {
            details.mimetype.push(relation.nodeValue);
        });
        return details;
    }

    protected extractThumbnailDetails(xml: string): Record<string, Array<string>> {
        const xmlParser = new DOMParser();
        const RDF_XML = xmlParser.parseFromString(xml, "text/xml");
        return this.extractRDFXML(
            RDF_XML,
            {
                rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                premis: "http://www.loc.gov/premis/rdf/v1#",
            },
            "//premis:*"
        );
    }

    async getFedoraData(pid: string, fetchRdf = true): Promise<FedoraData> {
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
        const dataStreams = fetchRdf ? this.extractFedoraDatastreams(RDF) : [];
        const relations = this.extractRelations(RELS);
        // Fetch license details if appropriate/available:
        const extraDetails: Record<string, Record<string, Array<string>>> = {};
        if (dataStreams.includes("LICENSE")) {
            const licenseStream = await this.fedora.getDatastream(pid, "LICENSE");
            extraDetails.license = { url: [this.extractLicense(licenseStream)] };
        }
        if (dataStreams.includes("AGENTS")) {
            const agentsStream = await this.fedora.getDatastream(pid, "AGENTS");
            extraDetails.agents = this.extractAgents(agentsStream);
        }
        if (dataStreams.includes("THUMBNAIL")) {
            const thumbRdf = await this.fedora.getRdf(pid + "/THUMBNAIL/fcr:metadata");
            extraDetails.thumbnails = this.extractThumbnailDetails(thumbRdf);
        }
        if (dataStreams.includes("MASTER-MD")) {
            const fitsXml = await this.fedora.getDatastream(pid, "MASTER-MD");
            extraDetails.fitsData = this.extractFitsData(fitsXml);
        }
        extraDetails.fullText = {};
        if (dataStreams.includes("OCR-DIRTY")) {
            extraDetails.fullText.ocrDirty = [await this.fedora.getDatastream(pid, "OCR-DIRTY")];
        }
        const models = relations.hasModel ?? [];
        if (models.includes("info:fedora/vudl-system:DOCData") || models.includes("info:fedora/vudl-system:PDFData")) {
            const extractor = new TikaExtractor(await this.fedora.getDatastream(pid, "MASTER"));
            extraDetails.fullText.fromDocument = [extractor.extractText()];
        }
        return new FedoraData(
            pid,
            relations,
            this.extractMetadata(DC),
            fetchRdf ? this.extractFedoraDetails(RDF) : {},
            dataStreams,
            extraDetails
        );
    }

    async getHierarchy(pid: string, fetchRdf = true): Promise<FedoraData> {
        const result = await this.getFedoraData(pid, fetchRdf);
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
