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

    async getFedoraData(pid: string): Promise<FedoraData> {
        // Use Fedora to get data
        const DCPromise = this.fedora.getDublinCore(pid);
        const RDFPromise = this.fedora.getRdf(pid, false);
        const [DC, RDF] = await Promise.all([DCPromise, RDFPromise]);
        const datastreams = this.extractor.extractFedoraDatastreams(RDF);

        const data = new FedoraData(
            pid,
            this.extractor.extractMetadata(DC),
            this.extractor.extractFedoraDetails(RDF),
            datastreams,
            {}
        );
        data.extraDetails = await this.getExtraDetails(pid, datastreams, data.models);
        return data;
    }

    async getExtraDetails(
        pid: string,
        datastreams: Array<string>,
        models: Array<string>
    ): Promise<Record<string, Record<string, Array<string>>>> {
        // Fetch license details if appropriate/available:
        const extraDetails: Record<string, Record<string, Array<string>>> = {};
        if (datastreams.includes("LICENSE")) {
            const licenseStream = await this.fedora.getDatastreamAsString(pid, "LICENSE");
            extraDetails.license = { url: [this.extractor.extractLicense(licenseStream)] };
        }
        if (datastreams.includes("AGENTS")) {
            const agentsStream = await this.fedora.getDatastreamAsString(pid, "AGENTS");
            extraDetails.agents = this.extractor.extractAgents(agentsStream);
        }
        if (datastreams.includes("THUMBNAIL")) {
            const thumbRdf = await this.fedora.getRdf(pid + "/THUMBNAIL/fcr:metadata");
            extraDetails.thumbnails = this.extractor.extractThumbnailDetails(thumbRdf);
        }
        if (datastreams.includes("MASTER-MD")) {
            const fitsXml = await this.fedora.getDatastreamAsString(pid, "MASTER-MD");
            extraDetails.fitsData = this.extractor.extractFitsData(fitsXml);
        }
        extraDetails.fullText = {};
        if (datastreams.includes("OCR-DIRTY")) {
            extraDetails.fullText.ocrDirty = [await this.fedora.getDatastreamAsString(pid, "OCR-DIRTY")];
        }
        if (models.includes("vudl-system:DOCData") || models.includes("vudl-system:PDFData")) {
            const extractor = new TikaExtractor((await this.fedora.getDatastream(pid, "MASTER")).body, this.config);
            extraDetails.fullText.fromDocument = [extractor.extractText()];
        }
        return extraDetails;
    }

    async getHierarchy(pid: string): Promise<FedoraData> {
        const result = await this.getFedoraData(pid);
        // Create promises to retrieve parents asynchronously...
        const promises = (result.fedoraDetails.isMemberOf ?? []).map(async (resource) => {
            const parentPid = resource.split("/").pop();
            const parent = await this.getHierarchy(parentPid);
            result.addParent(parent);
        });
        // Now wait for the promises to complete before we return results, so
        // nothing happens out of order.
        await Promise.all(promises);
        return result;
    }
}

export default HierarchyCollector;
