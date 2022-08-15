import Config from "../models/Config";
import Fedora from "./Fedora";

jest.mock("../models/Config");

describe("Fedora", () => {
    let fedora;
    let pid;
    let datastream;
    let config;
    let requestSpy;
    beforeEach(() => {
        config = {
            restBaseUrl: "/test1",
            username: "test2",
            password: "test3",
        };
        pid = "test4";
        datastream = "test5";
        jest.spyOn(Config, "getInstance").mockReturnValue(config);
        fedora = Fedora.getInstance();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("getDublinCore", () => {
        it("will fail if an unexpected status code is received", async () => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 404, body: "not found" });
            expect(async () => await fedora.getDublinCore("foo:123")).rejects.toThrowError(
                "Unexpected status code: 404"
            );
        });

        it("will return an appropriate response body when data exists", async () => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 200, body: "foo response" });
            expect(await fedora.getDublinCore("foo:123")).toEqual("foo response");
            expect(requestSpy).toHaveBeenCalledWith("get", "foo:123/DC", null, { parse_response: true });
        });
    });

    describe("getRdf", () => {
        it("will fail if an unexpected status code is received", async () => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 404, body: "not found" });
            expect(async () => await fedora.getRdf("foo:123")).rejects.toThrowError("Unexpected status code: 404");
        });

        it("will return an appropriate response body when data exists", async () => {
            requestSpy = jest
                .spyOn(fedora, "_request")
                .mockResolvedValue({ statusCode: 200, body: { toString: () => "foo response" } });
            expect(await fedora.getRdf("foo:123")).toEqual("foo response");
            expect(requestSpy).toHaveBeenCalledWith("get", "foo:123", null, {
                headers: { Accept: "application/rdf+xml" },
                parse_response: false,
            });
        });
    });

    describe("addRelationship", () => {
        beforeEach(() => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 204 });
        });

        it("will add a relationship with a literal object", () => {
            fedora.addRelationship(pid, "subject", "predicate", "object", true);
            expect(requestSpy).toHaveBeenCalledWith(
                "patch",
                "/" + pid,
                ' INSERT { <subject> <predicate> "object".\n } WHERE {  }',
                { headers: { "Content-Type": "application/sparql-update" } }
            );
        });

        it("will add a relationship with a URI object", () => {
            fedora.addRelationship(pid, "subject", "predicate", "object", false);
            expect(requestSpy).toHaveBeenCalledWith(
                "patch",
                "/" + pid,
                " INSERT { <subject> <predicate> <object>.\n } WHERE {  }",
                { headers: { "Content-Type": "application/sparql-update" } }
            );
        });
    });

    describe("deleteDatastream", () => {
        beforeEach(() => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({});
        });

        it("will delete a datastream", async () => {
            fedora.deleteDatastream(pid, datastream, {});
            expect(requestSpy).toHaveBeenCalledWith("delete", pid + "/" + datastream, null, {});
        });
    });

    describe("deleteDatastreamTombstone", () => {
        beforeEach(() => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({});
        });

        it("will delete a datastream tombstone", async () => {
            fedora.deleteDatastreamTombstone(pid, datastream, {});
            expect(requestSpy).toHaveBeenCalledWith("delete", pid + "/" + datastream + "/fcr:tombstone", null, {});
        });
    });

    describe("createContainer", () => {
        beforeEach(() => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 201 });
        });

        it("generates appropriate metadata", async () => {
            const addDatastreamSpy = jest.spyOn(fedora, "addDatastream").mockResolvedValue({});
            await fedora.createContainer("foo:123", "label", "A");
            const expectedHeaders = { headers: { "Content-Type": "text/turtle" } };
            const expectedTurtle = `<> <http://purl.org/dc/terms/title> "label";
    <info:fedora/fedora-system:def/model#label> "label";
    <info:fedora/fedora-system:def/model#state> "A";
    <info:fedora/fedora-system:def/model#ownerId> "diglibEditor".
`;
            expect(requestSpy).toHaveBeenCalledTimes(1);
            expect(requestSpy).toHaveBeenCalledWith("put", "/foo:123", expectedTurtle, expectedHeaders);
            expect(addDatastreamSpy).toHaveBeenCalledTimes(1);
            const expectedParams = {
                mimeType: "text/xml",
                logMessage: "Create initial Dublin Core record",
            };
            const expectedXml = `<oai_dc:dc xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
  <dc:identifier>foo:123</dc:identifier>
  <dc:title>label</dc:title>
</oai_dc:dc>
`;
            expect(addDatastreamSpy).toHaveBeenCalledWith("foo:123", "DC", expectedParams, expectedXml, [201]);
        });
    });

    describe("modifyObjectState", () => {
        beforeEach(() => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 204 });
        });

        it("will modify object state", async () => {
            fedora.modifyObjectState(pid, "Active");
            expect(requestSpy).toHaveBeenCalledWith(
                "patch",
                "/" + pid,
                'DELETE { <> <info:fedora/fedora-system:def/model#state> ?any . } INSERT { <> <info:fedora/fedora-system:def/model#state> "Active".\n' +
                    " } WHERE { ?id <info:fedora/fedora-system:def/model#state> ?any }",
                { headers: { "Content-Type": "application/sparql-update" } }
            );
        });
    });

    describe("updateSequenceRelationship", () => {
        beforeEach(() => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 204 });
        });

        it("will modify sequence relationship", async () => {
            fedora.updateSequenceRelationship(pid, "foo:100", 2);
            expect(requestSpy).toHaveBeenCalledWith(
                "patch",
                "/" + pid,
                'DELETE { <> <http://vudl.org/relationships#sequence> ?pos . } INSERT { <info:fedora/test4> <http://vudl.org/relationships#sequence> "foo:100#2".\n' +
                    ' } WHERE { ?id <http://vudl.org/relationships#sequence> ?pos . FILTER(REGEX(?pos, "foo:100#")) }',
                { headers: { "Content-Type": "application/sparql-update" } }
            );
        });
    });
});
