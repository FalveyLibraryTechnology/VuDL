import Config from "../models/Config";
import Fedora from "./Fedora";
import FedoraDataCollector from "./FedoraDataCollector";
import MetadataExtractor from "./MetadataExtractor";

describe("FedoraDataCollector", () => {
    let collector;
    beforeEach(() => {
        Config.setInstance(new Config({}));
        collector = FedoraDataCollector.getInstance();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("retrieves an appropriate hierarchy", async () => {
        const pid = "test:123";
        const parentPid = "test:124";
        const fedora = Fedora.getInstance();
        const extractor = MetadataExtractor.getInstance();
        const dcGenerator = function (name) {
            return {
                name,
                value: "foo",
                attributes: {},
                children: [],
            };
        };
        const dc1 = dcGenerator("dc1");
        const dc2 = dcGenerator("dc2");
        const dublinCoreSpy = jest.spyOn(fedora, "getDublinCore").mockResolvedValueOnce(dc1).mockResolvedValueOnce(dc2);
        const rdfSpy = jest.spyOn(fedora, "getRdf").mockResolvedValueOnce("rdf1").mockResolvedValueOnce("rdf2");
        const extraMetadataSpy = jest
            .spyOn(extractor, "extractMetadata")
            .mockReturnValueOnce({ "dc:title": ["test1"] })
            .mockReturnValueOnce({ "dc:title": ["test2"] });
        const details1 = { isMemberOf: [parentPid] };
        const details2 = { fake: ["stuff"] };
        const extractDetailsSpy = jest
            .spyOn(extractor, "extractFedoraDetails")
            .mockReturnValueOnce(details1)
            .mockReturnValueOnce(details2);
        const extractDatastreamsSpy = jest
            .spyOn(extractor, "extractFedoraDatastreams")
            .mockReturnValueOnce(["stream1"])
            .mockReturnValueOnce(["stream2"]);
        const result = await collector.getHierarchy(pid);
        expect(dublinCoreSpy).toHaveBeenCalledTimes(2);
        expect(dublinCoreSpy).toHaveBeenNthCalledWith(1, pid);
        expect(dublinCoreSpy).toHaveBeenNthCalledWith(2, parentPid);
        expect(rdfSpy).toHaveBeenCalledTimes(2);
        expect(rdfSpy).toHaveBeenNthCalledWith(1, pid);
        expect(rdfSpy).toHaveBeenNthCalledWith(2, parentPid);
        expect(extraMetadataSpy).toHaveBeenCalledTimes(2);
        expect(extraMetadataSpy).toHaveBeenNthCalledWith(1, dc1);
        expect(extraMetadataSpy).toHaveBeenNthCalledWith(2, dc2);
        expect(extractDetailsSpy).toHaveBeenCalledTimes(2);
        expect(extractDetailsSpy).toHaveBeenNthCalledWith(1, "rdf1");
        expect(extractDetailsSpy).toHaveBeenNthCalledWith(2, "rdf2");
        expect(extractDatastreamsSpy).toHaveBeenCalledTimes(2);
        expect(extractDatastreamsSpy).toHaveBeenNthCalledWith(1, "rdf1");
        expect(extractDatastreamsSpy).toHaveBeenNthCalledWith(2, "rdf2");
        expect(result.pid).toEqual(pid);
        expect(result.title).toEqual("test1");
        expect(result.fedoraDetails).toEqual(details1);
        expect(result.fedoraDatastreams).toEqual(["stream1"]);
        expect(result.parents.length).toEqual(1);
        const parent = result.parents[0];
        expect(parent.pid).toEqual(parentPid);
        expect(parent.title).toEqual("test2");
        expect(parent.fedoraDetails).toEqual(details2);
        expect(parent.fedoraDatastreams).toEqual(["stream2"]);
        expect(parent.parents.length).toEqual(0);
    });
});
