import Config from "../models/Config";

export interface FedoraDatastream {
    mimetype?: {
        allowedType: string;
        allowedSubtypes: string;
    };
}

export interface FedoraModel {
    datastreams?: Record<string, FedoraDatastream>;
}

class FedoraCatalog {
    private static instance: FedoraCatalog;

    config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    public static getInstance(): FedoraCatalog {
        if (!FedoraCatalog.instance) {
            FedoraCatalog.instance = new FedoraCatalog(Config.getInstance());
        }
        return FedoraCatalog.instance;
    }

    getCompleteCatalog(): Record<string, FedoraModel> {
        return this.config.models;
    }

    getModelCatalog(): Array<string> {
        return Object.keys(this.config.models);
    }

    getDatastreamCatalog(): Array<string> {
        return Object.values(this.config.models).reduce((acc, model) => {
            return [...acc, ...Object.keys(model.datastreams)];
        }, []);
    }

    getDatastreamMimetypes(): Record<string, FedoraDatastream> {
        return Object.values(this.config.models).reduce((acc: Record<string, FedoraDatastream>, model: FedoraModel) => {
            return { ...acc, ...model.datastreams };
        }, {});
    }
}

export default FedoraCatalog;
