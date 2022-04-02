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

    it("indexes hierarchies correctly", async () => {
        const changeSpy = jest.spyOn(indexer, "getChangeTrackerDetails").mockResolvedValue({});
        const pid = "test:123";
        const parentPid = "test:122";
        const grandparentPid = "test:121";
        const collector = HierarchyCollector.getInstance();
        const recordDetails = {
            hasModel: ["vudl-system:CoreModel", "vudl-system:DataModel", "vudl-system:ImageData"],
            sequence: [parentPid + "#1"],
        };
        const record = FedoraData.build(pid, { "dc:title": ["page"] }, recordDetails);
        const parentRecordDetails = {
            hasModel: ["vudl-system:CoreModel", "vudl-system:CollectionModel", "vudl-system:ListCollection"],
            sortOn: ["custom"],
        };
        const parentRecord = FedoraData.build(parentPid, { "dc:title": ["page list"] }, parentRecordDetails);
        record.addParent(parentRecord);
        const grandparentRecordDetails = {
            hasModel: ["vudl-system:CoreModel", "vudl-system:CollectionModel", "vudl-system:ResourceCollection"],
        };
        const grandparentRecord = FedoraData.build(grandparentPid, { "dc:title": ["test record"] }, grandparentRecordDetails);
        parentRecord.addParent(grandparentRecord);
        const getHierarchySpy = jest.spyOn(collector, "getHierarchy").mockResolvedValueOnce(record).mockResolvedValueOnce(parentRecord);
        const result = await indexer.getFields(pid);
        expect(result).toEqual({
            allfields: ["page"],
            collection: "Digital Library",
            datastream_str_mv: [],
            "dc.title_txt_mv": ["page"],
            dc_title_str: "page",
            fedora_parent_id_str_mv: [parentPid],
            has_order_str: "no",
            has_thumbnail_str: "false",
            hierarchy_all_parents_str_mv: [parentPid, grandparentPid],
            hierarchy_browse: ["test record{{{_ID_}}}test:121"],
            hierarchy_first_parent_id_str: grandparentPid,
            hierarchy_parent_id: [grandparentPid],
            hierarchy_parent_title: ["test record"],
            hierarchy_sequence: ["0000000000"],
            hierarchy_sequence_sort_str: "0000000000",
            hierarchy_top_id: [grandparentPid],
            hierarchy_top_title: ["test record"],
            hierarchytype: "",
            id: pid,
            institution: "My University",
            modeltype_str_mv: recordDetails.hasModel,
            record_format: "vudl",
            "relsext.hasModel_txt_mv": recordDetails.hasModel,
            "relsext.sequence_txt_mv": ["test:122#1"],
            sequence_test_122_str: "0000000001",
            title: "page",
            title_full: "page",
            title_short: "page",
            title_sort: "page",
        });
        const parentResult = await indexer.getFields(parentPid)
        expect(parentResult).toEqual({
            allfields: ["page list"],
            collection: "Digital Library",
            collection_title_sort_str: "page list",
            datastream_str_mv: [],
            "dc.title_txt_mv": ["page list"],
            dc_title_str: "page list",
            fedora_parent_id_str_mv: [grandparentPid],
            has_order_str: "yes",
            has_thumbnail_str: "false",
            hierarchy_all_parents_str_mv: [grandparentPid],
            hierarchy_browse: ["test record{{{_ID_}}}test:121"],
            hierarchy_first_parent_id_str: parentPid,
            hierarchy_parent_id: [grandparentPid],
            hierarchy_parent_title: ["test record"],
            hierarchy_sequence: ["0000000000"],
            hierarchy_sequence_sort_str: "0000000000",
            hierarchy_top_id: [grandparentPid],
            hierarchy_top_title: ["test record"],
            hierarchytype: "",
            id: parentPid,
            institution: "My University",
            modeltype_str_mv: parentRecordDetails.hasModel,
            "relsext.hasModel_txt_mv": parentRecordDetails.hasModel,
            record_format: "vudl",
            "relsext.sortOn_txt_mv": ["custom"],
            title: "page list",
            title_full: "page list",
            title_short: "page list",
            title_sort: "page list",
        });
        expect(getHierarchySpy).toHaveBeenCalledTimes(2);
        expect(getHierarchySpy).toHaveBeenNthCalledWith(1, pid);
        expect(getHierarchySpy).toHaveBeenNthCalledWith(2, parentPid);
        expect(changeSpy).toHaveBeenCalledTimes(2);
        expect(changeSpy).toHaveBeenNthCalledWith(1, pid, "1900-01-01T00:00:00Z");
        expect(changeSpy).toHaveBeenNthCalledWith(2, parentPid, "1900-01-01T00:00:00Z");
    });

    it("processes title data correctly", async () => {
        const changeSpy = jest.spyOn(indexer, "getChangeTrackerDetails").mockResolvedValue({});
        const pid = "test:123";
        const altTitle = "alternate title";
        const title = "the test title";
        const metadata = {
            "dc:title": [title, altTitle],
        };
        const collector = HierarchyCollector.getInstance();
        const record = FedoraData.build(pid, metadata);
        const getHierarchySpy = jest.spyOn(collector, "getHierarchy").mockResolvedValue(record);
        const result = await indexer.getFields(pid);
        expect(result).toEqual({
            allfields: [title, altTitle],
            collection: "Digital Library",
            collection_title_sort_str: "test title",
            datastream_str_mv: [],
            "dc.title_txt_mv": [title, altTitle],
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
            title_alt: [altTitle],
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
