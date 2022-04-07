import { Fedora } from "./Fedora";
import Config from "../models/Config";
import FedoraDataCollection from "../models/FedoraDataCollection";
import MetadataExtractor from "./MetadataExtractor";
import TikaExtractor from "./TikaExtractor";

class FedoraDataCollector {
    private static instance: FedoraDataCollector;

    fedora: Fedora;
    extractor: MetadataExtractor;
    config: Config;
    tika: TikaExtractor;

    constructor(fedora: Fedora, extractor: MetadataExtractor, config: Config, tika: TikaExtractor) {
        this.fedora = fedora;
        this.extractor = extractor;
        this.config = config;
        this.tika = tika;
    }

    public static getInstance(): FedoraDataCollector {
        if (!FedoraDataCollector.instance) {
            FedoraDataCollector.instance = new FedoraDataCollector(
                Fedora.getInstance(),
                MetadataExtractor.getInstance(),
                Config.getInstance(),
                TikaExtractor.getInstance()
            );
        }
        return FedoraDataCollector.instance;
    }

    async getObjectData(pid: string): Promise<FedoraDataCollection> {
        // Use Fedora to get data
        const DCPromise = this.fedora.getDublinCore(pid);
        const RDFPromise = this.fedora.getRdf(pid, false);
        const [DC, RDF] = await Promise.all([DCPromise, RDFPromise]);

        return new FedoraDataCollection(
            pid,
            this.extractor.extractMetadata(DC),
            this.extractor.extractFedoraDetails(RDF),
            this.extractor.extractFedoraDatastreams(RDF),
            this.fedora,
            this.extractor,
            this.tika
        );
    }

    async getHierarchy(pid: string): Promise<FedoraDataCollection> {
        const result = await this.getObjectData(pid);
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

export default FedoraDataCollector;
