import { FedoraObject } from "../models/FedoraObject";
import FedoraCatalog from "./FedoraCatalog";
import MetadataExtractor from "./MetadataExtractor";

class DatastreamManager {
    private static instance: DatastreamManager;
    fedoraCatalog: FedoraCatalog;

    constructor(fedoraCatalog: FedoraCatalog) {
        this.fedoraCatalog = fedoraCatalog;
    }

    static getInstance(): DatastreamManager {
        if (!DatastreamManager.instance) {
            DatastreamManager.instance = new DatastreamManager(FedoraCatalog.getInstance());
        }
        return DatastreamManager.instance;
    }

    async getMetadata(pid: string, stream: string): Promise<string> {
        const fedoraObject = FedoraObject.build(pid);
        const xml = await fedoraObject.getDatastreamMetadata(stream);
        return xml;
    }

    async getMimeType(pid: string, stream: string): Promise<string> {
        const metadataExtractor = MetadataExtractor.getInstance();
        const xml = await this.getMetadata(pid, stream);
        const ebuNode = metadataExtractor.extractEbuCore(xml, "//ebucore:hasMimeType");
        return ebuNode?.hasMimeType?.[0] || "";
    }

    async downloadBuffer(pid: string, stream: string): Promise<Buffer> {
        const fedoraObject = FedoraObject.build(pid);
        return await fedoraObject.getDatastreamAsBuffer(stream);
    }

    async uploadFile(pid: string, stream: string, filepath: string, mimeType: string): Promise<void> {
        const fedoraObject = FedoraObject.build(pid);

        if (this.hasValidMimeType(stream, mimeType)) {
            try {
                await fedoraObject.updateDatastreamFromFile(filepath, stream, mimeType);
            } catch (error) {
                console.error(error);
                if (error?.name === "HttpError" && error.statusCode === 410) {
                    await fedoraObject.deleteDatastreamTombstone(stream);
                    await fedoraObject.updateDatastreamFromFile(filepath, stream, mimeType);
                }
            }
        } else {
            throw new Error(`Invalid mime type: ${mimeType}`);
        }
    }

    async deleteDatastream(pid: string, stream: string): Promise<void> {
        const fedoraObject = FedoraObject.build(pid);
        await fedoraObject.deleteDatastream(stream);
    }

    hasValidMimeType(stream: string, mimeType: string): boolean {
        const mimeTypeHierarchy = mimeType.split("/");
        const allowedType = this.fedoraCatalog.getDatastreamMimetypes()?.[stream]?.mimetype?.allowedType;
        const allowedSubtypes = this.fedoraCatalog.getDatastreamMimetypes()?.[stream]?.mimetype?.allowedSubtypes;
        if (mimeTypeHierarchy.length == 2) {
            const [type, subtype] = mimeTypeHierarchy;
            return (
                allowedType &&
                allowedSubtypes &&
                (allowedType.includes(type) || allowedType.includes("*")) &&
                (allowedSubtypes.includes(subtype) || allowedSubtypes.includes("*"))
            );
        }
        return false;
    }
}

export default DatastreamManager;
