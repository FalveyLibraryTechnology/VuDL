import Config from "../models/Config";
import Fedora from "./Fedora";
import FedoraData from "../models/FedoraData";
import HierarchyCollector from "./HierarchyCollector";
import SolrIndexer from "./SolrIndexer";

describe("SolrIndexer", () => {
    let indexer;
    beforeEach(() => {
        Config.setInstance(
            new Config({
                articles_to_strip: ["a ", "an ", "the "],
                LanguageMap: { en: "English" },
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
        const grandparentRecord = FedoraData.build(
            grandparentPid,
            { "dc:title": ["test record"] },
            grandparentRecordDetails
        );
        parentRecord.addParent(grandparentRecord);
        const getHierarchySpy = jest
            .spyOn(collector, "getHierarchy")
            .mockResolvedValueOnce(record)
            .mockResolvedValueOnce(parentRecord);
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
        const parentResult = await indexer.getFields(parentPid);
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

    it("processes Dublin Core fields correctly", async () => {
        const changeSpy = jest.spyOn(indexer, "getChangeTrackerDetails").mockResolvedValue({});
        const pid = "test:123";
        const title = "title";
        const metadata = {
            "dc:title": [title],
            "dc:creator": ["Doe, Jane"],
            "dc:contributor": ["Smith, John"],
            "dc:language": ["en"],
            "dc:source": ["Source"],
            "dc:description": ["Description"],
            "dc:format": ["Book"],
            "dc:publisher": ["Publisher"],
            "dc:series": ["Series"],
            "dc:subject": ["Topic"],
            "dc:relation": ["Relation"],
            "dc:date": ["1979-12-06"],
        };
        const collector = HierarchyCollector.getInstance();
        const record = FedoraData.build(pid, metadata);
        const getHierarchySpy = jest.spyOn(collector, "getHierarchy").mockResolvedValue(record);
        const result = await indexer.getFields(pid);
        expect(result).toEqual({
            allfields: [
                title,
                "Doe, Jane",
                "Smith, John",
                "en",
                "Source",
                "Description",
                "Book",
                "Publisher",
                "Series",
                "Topic",
                "Relation",
                "1979-12-06",
            ],
            author: ["Doe, Jane"],
            author2: ["Smith, John"],
            author_sort: "Doe, Jane",
            collection: "Digital Library",
            collection_title_sort_str: title,
            datastream_str_mv: [],
            "dc.contributor_txt_mv": ["Smith, John"],
            "dc.creator_txt_mv": ["Doe, Jane"],
            "dc.date_txt_mv": ["1979-12-06"],
            "dc.description_txt_mv": ["Description"],
            "dc.format_txt_mv": ["Book"],
            "dc.language_txt_mv": ["en"],
            "dc.publisher_txt_mv": ["Publisher"],
            "dc.relation_txt_mv": ["Relation"],
            "dc.series_txt_mv": ["Series"],
            "dc.source_txt_mv": ["Source"],
            "dc.subject_txt_mv": ["Topic"],
            "dc.title_txt_mv": [title],
            dc_date_str: "1979-12-06",
            dc_relation_str: "Relation",
            dc_source_str_mv: ["Source"],
            dc_title_str: title,
            description: ["Description"],
            fedora_parent_id_str_mv: [],
            format: ["Book"],
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
            language: ["English"],
            modeltype_str_mv: [],
            normalized_sort_date: "1979-12-06T00:00:00Z",
            publishDate: "1979",
            publishDateSort: "1979",
            publisher: ["Publisher"],
            publisher_str_mv: ["Publisher"],
            record_format: "vudl",
            series: ["Relation"],
            title: title,
            title_full: title,
            title_short: title,
            title_sort: title,
            topic: ["Topic"],
            topic_facet: ["Topic"],
            topic_str_mv: ["Topic"],
        });
        expect(getHierarchySpy).toHaveBeenCalledTimes(1);
        expect(getHierarchySpy).toHaveBeenCalledWith(pid);
        expect(changeSpy).toHaveBeenCalledTimes(1);
        expect(changeSpy).toHaveBeenCalledWith(pid, "1900-01-01T00:00:00Z");
    });

    it("processes agent data correctly", async () => {
        const changeSpy = jest.spyOn(indexer, "getChangeTrackerDetails").mockResolvedValue({});
        const pid = "test:123";
        const collector = HierarchyCollector.getInstance();
        const record = FedoraData.build(pid, {}, {}, ["AGENTS"]);
        const getHierarchySpy = jest.spyOn(collector, "getHierarchy").mockResolvedValue(record);
        const fedora = Fedora.getInstance();
        const agentXml = `<METS:metsHdr xmlns:METS="http://www.loc.gov/METS/" CREATEDATE="2012-08-16T02:28:47.698Z" LASTMODDATE="2012-08-17T20:25:54.802Z" RECORDSTATUS="PUBLISHED">
    <METS:agent ROLE="DISSEMINATOR" TYPE="ORGANIZATION">
        <METS:name>Falvey Memorial Library, Villanova University</METS:name>
    </METS:agent>
    <METS:agent ROLE="CREATOR" TYPE="INDIVIDUAL">
        <METS:name>MPF</METS:name>
    </METS:agent>
    <METS:agent ROLE="EDITOR" TYPE="INDIVIDUAL">
        <METS:name>MPF</METS:name>
    </METS:agent>
</METS:metsHdr>`;
        const getStreamSpy = jest.spyOn(fedora, "getDatastreamAsString").mockResolvedValue(agentXml);
        const result = await indexer.getFields(pid);
        expect(result).toEqual({
            "agent.name_txt_mv": ["Falvey Memorial Library, Villanova University", "MPF", "MPF"],
            allfields: [],
            collection: "Digital Library",
            datastream_str_mv: ["AGENTS"],
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
        expect(getStreamSpy).toHaveBeenCalledTimes(1);
        expect(getStreamSpy).toHaveBeenCalledWith(pid, "AGENTS");
        expect(getHierarchySpy).toHaveBeenCalledTimes(1);
        expect(getHierarchySpy).toHaveBeenCalledWith(pid);
        expect(changeSpy).toHaveBeenCalledTimes(1);
        expect(changeSpy).toHaveBeenCalledWith(pid, "1900-01-01T00:00:00Z");
    });

    it("processes license data correctly", async () => {
        const changeSpy = jest.spyOn(indexer, "getChangeTrackerDetails").mockResolvedValue({});
        const pid = "test:123";
        const collector = HierarchyCollector.getInstance();
        const record = FedoraData.build(pid, {}, {}, ["LICENSE"]);
        const getHierarchySpy = jest.spyOn(collector, "getHierarchy").mockResolvedValue(record);
        const fedora = Fedora.getInstance();
        const licenseXml = `<METS:rightsMD xmlns:METS="http://www.loc.gov/METS/" ID="0">
    <METS:mdRef xmlns:xlink="http://www.w3.org/1999/xlink" LOCTYPE="URL" MDTYPE="OTHER" MIMETYPE="text/html" OTHERMDTYPE="HTML" xlink:href="http://creativecommons.org/licenses/by-sa/4.0/"></METS:mdRef>
</METS:rightsMD>`;
        const getStreamSpy = jest.spyOn(fedora, "getDatastreamAsString").mockResolvedValue(licenseXml);
        const result = await indexer.getFields(pid);
        expect(result).toEqual({
            allfields: [],
            collection: "Digital Library",
            datastream_str_mv: ["LICENSE"],
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
            "license.mdRef_str": "http://creativecommons.org/licenses/by-sa/4.0/",
            modeltype_str_mv: [],
            record_format: "vudl",
        });
        expect(getStreamSpy).toHaveBeenCalledTimes(1);
        expect(getStreamSpy).toHaveBeenCalledWith(pid, "LICENSE");
        expect(getHierarchySpy).toHaveBeenCalledTimes(1);
        expect(getHierarchySpy).toHaveBeenCalledWith(pid);
        expect(changeSpy).toHaveBeenCalledTimes(1);
        expect(changeSpy).toHaveBeenCalledWith(pid, "1900-01-01T00:00:00Z");
    });

    it("processes thumbnail data correctly", async () => {
        const changeSpy = jest.spyOn(indexer, "getChangeTrackerDetails").mockResolvedValue({});
        const pid = "test:123";
        const collector = HierarchyCollector.getInstance();
        const record = FedoraData.build(pid, {}, {}, ["THUMBNAIL"]);
        const getHierarchySpy = jest.spyOn(collector, "getHierarchy").mockResolvedValue(record);
        const fedora = Fedora.getInstance();
        const agentXml = `<rdf:RDF
        xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
        xmlns:dcterms="http://purl.org/dc/terms/"
        xmlns:ebucore="http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#"
        xmlns:premis="http://www.loc.gov/premis/rdf/v1#"
        xmlns:fedora="http://fedora.info/definitions/v4/repository#"
        xmlns:ldp="http://www.w3.org/ns/ldp#"
        xmlns:j.0="http://fedora.info/definitions/1/0/access/" > 
      <rdf:Description rdf:about="http://localhost:8080/rest/vudl:8/THUMBNAIL">
        <j.0:objState>A</j.0:objState>
        <rdf:type rdf:resource="http://fedora.info/definitions/v4/repository#Binary"/>
        <rdf:type rdf:resource="http://fedora.info/definitions/v4/repository#Resource"/>
        <fedora:hasFixityService rdf:resource="http://localhost:8080/rest/vudl:8/THUMBNAIL/fcr:fixity"/>
        <premis:hasMessageDigest rdf:resource="urn:md5:fb36b2582b217396361c85e784015efb"/>
        <rdf:type rdf:resource="http://www.w3.org/ns/ldp#Resource"/>
        <ebucore:filename>THUMBNAIL</ebucore:filename>
        <fedora:lastModified rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">2022-03-18T19:51:22.280867Z</fedora:lastModified>
        <premis:hasMessageDigest rdf:resource="urn:sha-512:6165712b868b5ffcc0885a7c069bc7d0bab981da54864c23ec8a3a1444c2c3ec76fbf662806095558f7e045759e8b7f442787b0eb8a9f2bbbb4d21509abe1896"/>
        <rdf:type rdf:resource="http://www.w3.org/ns/ldp#NonRDFSource"/>
        <dcterms:title>vudl_8_THUMBNAIL</dcterms:title>
        <ebucore:hasMimeType>image/jpeg</ebucore:hasMimeType>
        <premis:hasSize rdf:datatype="http://www.w3.org/2001/XMLSchema#long">1005</premis:hasSize>
        <fedora:created rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">2022-03-18T19:51:22.234645Z</fedora:created>
      </rdf:Description>
    </rdf:RDF>`;
        const getRdfSpy = jest.spyOn(fedora, "getRdf").mockResolvedValue(agentXml);
        const result = await indexer.getFields(pid);
        expect(result).toEqual({
            THUMBNAIL_contentDigest_digest_str: "fb36b2582b217396361c85e784015efb",
            allfields: [],
            collection: "Digital Library",
            datastream_str_mv: ["THUMBNAIL"],
            fedora_parent_id_str_mv: [],
            has_order_str: "no",
            has_thumbnail_str: "true",
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
        expect(getRdfSpy).toHaveBeenCalledTimes(1);
        expect(getRdfSpy).toHaveBeenCalledWith(pid + "/THUMBNAIL/fcr:metadata");
        expect(getHierarchySpy).toHaveBeenCalledTimes(1);
        expect(getHierarchySpy).toHaveBeenCalledWith(pid);
        expect(changeSpy).toHaveBeenCalledTimes(1);
        expect(changeSpy).toHaveBeenCalledWith(pid, "1900-01-01T00:00:00Z");
    });
});
