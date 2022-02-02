import { Fedora } from "./Fedora";
import Config from "../models/Config";
import FedoraData from "../models/FedoraData";
import MetadataExtractor from "./MetadataExtractor";
import TikaExtractor from "./TikaExtractor";

class HierarchyCollector {
    private static instance: HierarchyCollector;

    fedora: Fedora;
    extractor: MetadataExtractor;
    config: Config;

    constructor(fedora: Fedora, extractor: MetadataExtractor, config: Config) {
        this.fedora = fedora;
        this.extractor = extractor;
        this.config = config;
    }

    public static getInstance(): HierarchyCollector {
        if (!HierarchyCollector.instance) {
            HierarchyCollector.instance = new HierarchyCollector(
                Fedora.getInstance(),
                MetadataExtractor.getInstance(),
                Config.getInstance()
            );
        }
        return HierarchyCollector.instance;
    }

    async getFedoraData(pid: string, fetchRdf = true): Promise<FedoraData> {
        // Use Fedora to get data
        const DCPromise = this.fedora.getDublinCore(pid);
        const RELSPromise = this.fedora.getDatastreamAsString(pid, "RELS-EXT");
        // For indexing purposes, we only need the RDF information for the
        // first object retrieved; so when we recurse higher into the tree,
        // we can skip fetching more RDF in order to save some time!
        const RDFPromise = fetchRdf ? this.fedora.getRdf(pid) : null;
        const [DC, RELS, RDF] = await Promise.all([DCPromise, RELSPromise, RDFPromise]);
        const dataStreams = fetchRdf ? this.extractor.extractFedoraDatastreams(RDF) : [];
        const relations = this.extractor.extractRelations(RELS);
        // Fetch license details if appropriate/available:
        const extraDetails: Record<string, Record<string, Array<string>>> = {};
        if (dataStreams.includes("LICENSE")) {
            const licenseStream = await this.fedora.getDatastreamAsString(pid, "LICENSE");
            extraDetails.license = { url: [this.extractor.extractLicense(licenseStream)] };
        }
        if (dataStreams.includes("AGENTS")) {
            const agentsStream = await this.fedora.getDatastreamAsString(pid, "AGENTS");
            extraDetails.agents = this.extractor.extractAgents(agentsStream);
        }
        if (dataStreams.includes("THUMBNAIL")) {
            const thumbRdf = await this.fedora.getRdf(pid + "/THUMBNAIL/fcr:metadata");
            extraDetails.thumbnails = this.extractor.extractThumbnailDetails(thumbRdf);
        }
        if (dataStreams.includes("MASTER-MD")) {
            const fitsXml = await this.fedora.getDatastreamAsString(pid, "MASTER-MD");
            extraDetails.fitsData = this.extractor.extractFitsData(fitsXml);
        }
        extraDetails.fullText = {};
        if (dataStreams.includes("OCR-DIRTY")) {
            extraDetails.fullText.ocrDirty = [await this.fedora.getDatastreamAsString(pid, "OCR-DIRTY")];
        }
        const models = relations.hasModel ?? [];
        if (models.includes("info:fedora/vudl-system:DOCData") || models.includes("info:fedora/vudl-system:PDFData")) {
            const extractor = new TikaExtractor((await this.fedora.getDatastream(pid, "MASTER")).body, this.config);
            extraDetails.fullText.fromDocument = [extractor.extractText()];
        }
        return new FedoraData(
            pid,
            relations,
            this.extractor.extractMetadata(DC),
            fetchRdf ? this.extractor.extractFedoraDetails(RDF) : {},
            dataStreams,
            extraDetails
        );
    }

    async getHierarchy(pid: string, fetchRdf = true): Promise<FedoraData> {
        const result = await this.getFedoraData(pid, fetchRdf);
        // Create promises to retrieve parents asynchronously...
        const promises = (result.relations.isMemberOf ?? []).map(async (resource) => {
            const parentPid = resource.substr("info:fedora/".length);
            // The "false" here skips RDF retrieval:
            const parent = await this.getHierarchy(parentPid, false);
            result.addParent(parent);
        });
        // Now wait for the promises to complete before we return results, so
        // nothing happens out of order.
        await Promise.all(promises);
        return result;
    }
}

export default HierarchyCollector;
