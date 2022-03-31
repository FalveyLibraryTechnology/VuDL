import Config from "../models/Config";
import FedoraData from "../models/FedoraData";
import HierarchyCollector from "./HierarchyCollector";
import SolrIndexer from "./SolrIndexer";

describe("SolrIndexer", () => {
    let indexer;
    beforeEach(() => {
        Config.setInstance(
            new Config({
                articles_to_strip: ["a ", "an ", "the "],
            })
        );
        indexer = SolrIndexer.getInstance();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("returns reasonable results in response to almost-empty input", async () => {
        const changeSpy = jest.spyOn(indexer, "getChangeTrackerDetails").mockResolvedValue({});
        const pid = "test:123";
        const collector = HierarchyCollector.getInstance();
        const record = FedoraData.build(pid);
        const getHierarchySpy = jest.spyOn(collector, "getHierarchy").mockResolvedValue(record);
        const result = await indexer.getFields(pid);
        expect(result).toEqual({
            allfields: [],
            collection: "Digital Library",
            datastream_str_mv: [],
            fedora_parent_id_str_mv: [],
            has_order_str: "no",
            has_thumbnail_str: "false",
            hierarchy_all_parents_str_mv: [],
            hierarchy_first_parent_id_str: pid,
            hierarchy_parent_title: [],
            hierarchy_sequence: "0000000000",
            hierarchy_top_id: [pid],
            hierarchy_top_title: [""],
            hierarchytype: "",
            id: pid,
            institution: "My University",
            modeltype_str_mv: [],
            record_format: "vudl",
        });
        expect(getHierarchySpy).toHaveBeenCalledTimes(1);
        expect(getHierarchySpy).toHaveBeenCalledWith(pid);
        expect(changeSpy).toHaveBeenCalledTimes(1);
        expect(changeSpy).toHaveBeenCalledWith(pid, "1900-01-01T00:00:00Z");
    });

    it("returns reasonable results in response to fully-populated input", async () => {
        const changeSpy = jest.spyOn(indexer, "getChangeTrackerDetails").mockResolvedValue({});
        const pid = "test:123";
        const title = "the test title";
        const metadata = {
            "dc:title": [title],
        };
        const collector = HierarchyCollector.getInstance();
        const record = FedoraData.build(pid, metadata);
        const getHierarchySpy = jest.spyOn(collector, "getHierarchy").mockResolvedValue(record);
        const result = await indexer.getFields(pid);
        expect(result).toEqual({
            allfields: [title],
            collection: "Digital Library",
            collection_title_sort_str: "test title",
            datastream_str_mv: [],
            "dc.title_txt_mv": [title],
            dc_title_str: title,
            fedora_parent_id_str_mv: [],
            has_order_str: "no",
            has_thumbnail_str: "false",
            hierarchy_all_parents_str_mv: [],
            hierarchy_first_parent_id_str: pid,
            hierarchy_parent_title: [],
            hierarchy_sequence: "0000000000",
            hierarchy_top_id: [pid],
            hierarchy_top_title: [title],
            hierarchytype: "",
            id: pid,
            institution: "My University",
            modeltype_str_mv: [],
            record_format: "vudl",
            title: title,
            title_full: title,
            title_short: title,
            title_sort: "test title",
        });
        expect(getHierarchySpy).toHaveBeenCalledTimes(1);
        expect(getHierarchySpy).toHaveBeenCalledWith(pid);
        expect(changeSpy).toHaveBeenCalledTimes(1);
        expect(changeSpy).toHaveBeenCalledWith(pid, "1900-01-01T00:00:00Z");
    });
});
