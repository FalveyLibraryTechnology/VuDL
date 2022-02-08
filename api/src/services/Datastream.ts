import { FedoraObject } from "../models/FedoraObject";
import FedoraCatalog from "./FedoraCatalog";

class Datastream {
    private static instance: Datastream;
    fedoraCatalog: FedoraCatalog;

    constructor(fedoraCatalog: FedoraCatalog) {
        this.fedoraCatalog = fedoraCatalog;
    }

    static getInstance(): Datastream {
        if (!Datastream.instance) {
            Datastream.instance = new Datastream(FedoraCatalog.getInstance());
        }
        return Datastream.instance;
    }

    async uploadFile(pid: string, stream: string, filepath: string, mimeType: string): Promise<void> {
        const fedoraObject = FedoraObject.build(pid);
        if (this.hasValidMimeType(stream, mimeType)) {
            await fedoraObject.updateDatastreamFromFile(filepath, stream, mimeType);
        } else {
            throw new Error("Invalid mime types");
        }
    }

    hasValidMimeType(stream: string, mimeType: string): boolean {
        const [type, subtype] = mimeType.split("/");
        const { allowedType, allowedSubtypes } = this.fedoraCatalog.getDatastreamMimetypes()?.[stream]?.mimetype;

        return (
            (allowedType.includes(type) || allowedType.includes("*")) &&
            (allowedSubtypes.includes(subtype) || allowedSubtypes.includes("*"))
        );
    }
}

export default Datastream;
