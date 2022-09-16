import Config from "../models/Config";
import Solr from "./Solr";

export interface FedoraDatastream {
    mimetype?: {
        allowedType: string;
        allowedSubtypes: string;
    };
}

export interface FedoraModel {
    datastreams?: Record<string, FedoraDatastream>;
}

export interface Agents {
    defaults: Record<string, string>;
    roles: Array<string>;
    types: Array<string>;
}
export interface License {
    name: string;
    uri: string;
}
export interface CompleteCatalog {
    agents: Agents;
    dublinCoreFields: Record<string, Record<string, string>>;
    licenses: Record<string, License>;
    models: Record<string, FedoraModel>;
    favoritePids: Record<string, string>;
}

class FedoraCatalog {
    private static instance: FedoraCatalog;

    config: Config;
    solr: Solr;

    constructor(config: Config, solr: Solr) {
        this.config = config;
        this.solr = solr;
    }

    public static getInstance(): FedoraCatalog {
        if (!FedoraCatalog.instance) {
            FedoraCatalog.instance = new FedoraCatalog(Config.getInstance(), Solr.getInstance());
        }
        return FedoraCatalog.instance;
    }

    async getCompleteCatalog(): Promise<CompleteCatalog> {
        const { models, licenses, agentDefaults, agentRoles, agentTypes } = this.config;
        return {
            agents: {
                defaults: agentDefaults,
                roles: agentRoles,
                types: agentTypes,
            },
            dublinCoreFields: this.getDublinCoreFields(),
            favoritePids: await this.getFavoritePids(),
            models,
            licenses,
        };
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

    getDublinCoreFields(): Record<string, Record<string, string>> {
        // TODO: make configurable
        return {
            "dc:title": { "label": "Title", "type": "text" },
            "dc:creator": { "label": "Creator", "type": "text" },
            "dc:subject": { "label": "Subject", "type": "text" },
            "dc:description": { "label": "Description", "type": "html" },
            "dc:publisher": { "label": "Publisher", "type": "text" },
            "dc:contributor": { "label": "Contributor", "type": "text" },
            "dc:date": { "label": "Date", "type": "text" },
            "dc:type": { "label": "Type", "type": "text" },
            "dc:format": { "label": "Format", "type": "dropdown" },
            "dc:identifier": { "label": "Identifier", "type": "locked" },
            "dc:source": { "label": "Source", "type": "text" },
            "dc:language": { "label": "Language", "type": "dropdown" },
            "dc:relation": { "label": "Relation", "type": "text" },
            "dc:coverage": { "label": "Coverage", "type": "text" },
            "dc:rights": { "label": "Rights", "type": "text" },
        };
    }

    async getFavoritePids(): Promise<Record<string, string>> {
        const pids = this.config.favoritePids;
        const result = {};
        if (pids.length > 0) {
            const query = pids
                .map((pid) => {
                    return `id:"${pid.replace('"', "")}"`;
                })
                .join(" OR ");
            const solrResponse = await this.solr.query(this.config.solrCore, query, {
                fl: "id,title",
                rows: pids.length.toString(),
            });
            const docs = solrResponse?.body?.response?.docs ?? [];
            const titleMap = {};
            docs.forEach((doc) => {
                titleMap[doc.id] = `${doc.title ?? "-"} [${doc.id}]`;
            });
            pids.forEach((pid) => {
                result[pid] = titleMap[pid] ?? pid;
            });
        }
        return result;
    }
}

export default FedoraCatalog;
