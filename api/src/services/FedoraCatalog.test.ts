import Config from "../models/Config";
import Solr from "./Solr";
import FedoraCatalog from "./FedoraCatalog";

describe("FedoraCatalog", () => {
    describe("getCompleteCatalog", () => {
        const expectedDcFieldsCatalog = {
            "dc:title": { label: "Title", type: "text" },
            "dc:creator": { label: "Creator", type: "text" },
            "dc:subject": { label: "Subject", type: "text" },
            "dc:description": { label: "Description", type: "html" },
            "dc:publisher": { label: "Publisher", type: "text" },
            "dc:contributor": { label: "Contributor", type: "text" },
            "dc:date": { label: "Date", type: "text" },
            "dc:type": { label: "Type", type: "text" },
            "dc:format": { label: "Format", type: "dropdown" },
            "dc:identifier": { label: "Identifier", type: "locked" },
            "dc:source": { label: "Source", type: "text" },
            "dc:language": { label: "Language", type: "dropdown" },
            "dc:relation": { label: "Relation", type: "text" },
            "dc:coverage": { label: "Coverage", type: "text" },
            "dc:rights": { label: "Rights", type: "text" },
        };
        let config;
        let solr;
        let solrResponse;
        let core;
        let query;
        let solrParams;

        beforeEach(() => {
            config = new Config({ favorite_pids: ["foo:123", "foo:124"] });
            solr = {
                query: jest.fn(),
            };
            solrResponse = {};
            solr.query.mockImplementation((c, q, sP) => {
                core = c;
                query = q;
                solrParams = sP;
                return solrResponse;
            });
            jest.spyOn(Config, "getInstance").mockImplementation(() => config);
            jest.spyOn(Solr, "getInstance").mockReturnValue(solr);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("returns a catalog with appropriate agent information", async () => {
            config = new Config({
                agent: { roles: ["A", "B"], types: ["C", "D"], defaults: { name: "E", role: "A", type: "C" } },
            });
            const expectedCatalog = {
                agents: {
                    defaults: { name: "E", role: "A", type: "C" },
                    roles: ["A", "B"],
                    types: ["C", "D"],
                },
                dublinCoreFields: expectedDcFieldsCatalog,
                favoritePids: {},
                licenses: {},
                models: {},
            };
            expect(await FedoraCatalog.getInstance().getCompleteCatalog()).toEqual(expectedCatalog);
        });

        it("returns a catalog based on the configuration, tolerating empty Solr PIDS response", async () => {
            const expectedCatalog = {
                agents: {
                    defaults: {},
                    roles: [],
                    types: [],
                },
                dublinCoreFields: expectedDcFieldsCatalog,
                favoritePids: {
                    "foo:123": "foo:123",
                    "foo:124": "foo:124",
                },
                licenses: {},
                models: {},
            };
            const catalog = new FedoraCatalog(config, solr);
            expect(await catalog.getCompleteCatalog()).toEqual(expectedCatalog);
        });

        it("returns a catalog based on the configuration, utilizing non-empty Solr PIDS response", async () => {
            solrResponse = {
                body: { response: { docs: [{ id: "foo:123" }, { id: "foo:124", title: "second title" }] } },
            };
            const expectedCatalog = {
                agents: {
                    defaults: {},
                    roles: [],
                    types: [],
                },
                dublinCoreFields: expectedDcFieldsCatalog,
                favoritePids: {
                    "foo:123": "- [foo:123]", // test missing title in Solr response
                    "foo:124": "second title [foo:124]",
                },
                licenses: {},
                models: {},
            };
            const catalog = new FedoraCatalog(config, solr);
            expect(await catalog.getCompleteCatalog()).toEqual(expectedCatalog);
            expect(core).toEqual("biblio");
            expect(query).toEqual('id:"foo:123" OR id:"foo:124"');
            expect(solrParams).toEqual({ fl: "id,title", rows: "2" });
        });
    });
});
