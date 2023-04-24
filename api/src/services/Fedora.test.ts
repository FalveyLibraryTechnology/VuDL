import Config from "../models/Config";
import Fedora from "./Fedora";

describe("Fedora", () => {
    let fedora;
    let pid;
    let datastream;
    let requestSpy;
    beforeEach(() => {
        Config.setInstance(
            new Config({
                restBaseUrl: "/test1",
                username: "test2",
                password: "test3",
            })
        );
        pid = "test4";
        datastream = "test5";
        fedora = Fedora.getInstance();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("getDublinCore", () => {
        it("will fail if an unexpected status code is received", async () => {
            requestSpy = jest
                .spyOn(fedora, "_request")
                .mockResolvedValue({ statusCode: 500, body: "internal server error" });
            expect(async () => await fedora.getDublinCore("foo:123")).rejects.toThrowError(
                "Unexpected status code: 500"
            );
        });

        it("will return empty data if datastream does not exist", async () => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 404, body: "not found" });
            expect(await fedora.getDublinCore("foo:123")).toEqual({});
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

    describe("deleteParentRelationship", () => {
        beforeEach(() => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 204 });
        });

        it("will delete parent relationship", async () => {
            fedora.deleteParentRelationship(pid, "foo:100");
            expect(requestSpy).toHaveBeenCalledWith(
                "patch",
                "/" + pid,
                "DELETE { <> <info:fedora/fedora-system:def/relations-external#isMemberOf> <info:fedora/foo:100> . } WHERE {  }",
                { headers: { "Content-Type": "application/sparql-update" } }
            );
        });
    });

    describe("deleteSequenceRelationship", () => {
        beforeEach(() => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 204 });
        });

        it("will delete sequence relationship", async () => {
            fedora.deleteSequenceRelationship(pid, "foo:100");
            expect(requestSpy).toHaveBeenCalledWith(
                "patch",
                "/" + pid,
                'DELETE { <> <http://vudl.org/relationships#sequence> ?pos . } WHERE { ?id <http://vudl.org/relationships#sequence> ?pos . FILTER(REGEX(?pos, "foo:100#")) }',
                { headers: { "Content-Type": "application/sparql-update" } }
            );
        });
    });

    describe("updateSequenceRelationship", () => {
        beforeEach(() => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 204 });
        });

        it("will modify sequence relationship", async () => {
            await fedora.updateSequenceRelationship(pid, "foo:100", 2);
            expect(requestSpy).toHaveBeenCalledWith(
                "patch",
                "/" + pid,
                'DELETE { <> <http://vudl.org/relationships#sequence> ?pos . } INSERT { <info:fedora/test4> <http://vudl.org/relationships#sequence> "foo:100#2".\n' +
                    ' } WHERE { OPTIONAL { ?id <http://vudl.org/relationships#sequence> ?pos . FILTER(REGEX(?pos, "foo:100#")) } }',
                { headers: { "Content-Type": "application/sparql-update" } }
            );
        });
    });

    describe("updateSortOnRelationship", () => {
        beforeEach(() => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 204 });
        });

        it("prevents invalid input", async () => {
            let message = "";
            try {
                await fedora.updateSortOnRelationship(pid, "invalid");
            } catch (e) {
                message = e.message;
            }
            expect(message).toEqual("Unexpected sortOn value: invalid");
        });

        it("will modify sortOn relationship", async () => {
            await fedora.updateSortOnRelationship(pid, "custom");
            expect(requestSpy).toHaveBeenCalledWith(
                "patch",
                "/" + pid,
                'DELETE { <> <http://vudl.org/relationships#sortOn> ?any . } INSERT { <info:fedora/test4> <http://vudl.org/relationships#sortOn> "custom".\n' +
                    " } WHERE { ?id <http://vudl.org/relationships#sortOn> ?any }",
                { headers: { "Content-Type": "application/sparql-update" } }
            );
        });

        it("handles unexpected codes", async () => {
            requestSpy.mockResolvedValue({ statusCode: 500 });
            let message = "";
            try {
                await fedora.updateSortOnRelationship(pid, "custom");
            } catch (e) {
                message = e.message;
            }
            expect(message).toEqual("Expected 204 No Content response, received: 500");
        });
    });

    describe("putDatastream", () => {
        it("builds an appropriate request", async () => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 201 });
            await fedora.putDatastream("pid:123", "MYSTREAM", "text/plain", [201], "my data is here", "my link header");
            expect(requestSpy).toHaveBeenCalledWith("put", "/pid:123/MYSTREAM", "my data is here", {
                headers: {
                    "Content-Disposition": 'attachment; filename="MYSTREAM"',
                    "Content-Type": "text/plain",
                    Digest: "md5=ce851d9cd2bee2c2eeceaea99e62145d, sha-512=a4daa746ea902fe69c45dbce6ded92306206b75928e3df01b395ee896f08e5209a92493bc3f951ada968f1dc264552d9a92747adfbab1892bb6ebc1ac757d307",
                    Link: "my link header",
                },
            });
        });
        it("can succeed after retrying 409 status", async () => {
            requestSpy = jest
                .spyOn(fedora, "_request")
                .mockResolvedValueOnce({ statusCode: 409 })
                .mockResolvedValueOnce({ statusCode: 201 });
            const logSpy = jest.spyOn(fedora, "log");
            await fedora.putDatastream("pid:123", "MYSTREAM", "text/plain", [201], "my data is here", "my link header");
            expect(requestSpy).toHaveBeenCalledWith("put", "/pid:123/MYSTREAM", "my data is here", {
                headers: {
                    "Content-Disposition": 'attachment; filename="MYSTREAM"',
                    "Content-Type": "text/plain",
                    Digest: "md5=ce851d9cd2bee2c2eeceaea99e62145d, sha-512=a4daa746ea902fe69c45dbce6ded92306206b75928e3df01b395ee896f08e5209a92493bc3f951ada968f1dc264552d9a92747adfbab1892bb6ebc1ac757d307",
                    Link: "my link header",
                },
            });
            expect(logSpy).toHaveBeenCalledWith("Encountered 409 error; retry #1...");
            expect(logSpy).toHaveBeenCalledTimes(1);
        });
        it("can run out of 409 retries", async () => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({ statusCode: 409 });
            const logSpy = jest.spyOn(fedora, "log");
            let message = "";
            try {
                await fedora.putDatastream(
                    "pid:123",
                    "MYSTREAM",
                    "text/plain",
                    [201],
                    "my data is here",
                    "my link header"
                );
            } catch (e) {
                message = e.message;
            }
            expect(logSpy).toHaveBeenCalledWith("Encountered 409 error; retry #1...");
            expect(logSpy).toHaveBeenCalledWith("Encountered 409 error; retry #2...");
            expect(logSpy).toHaveBeenCalledWith("Encountered 409 error; retry #3...");
            expect(logSpy).toHaveBeenCalledTimes(3);
            expect(message).toEqual("Expected 201 Created response, received: 409");
        });
    });
});
