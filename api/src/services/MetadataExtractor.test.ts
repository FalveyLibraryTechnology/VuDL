import MetadataExtractor from "./MetadataExtractor";
import { DOMParser } from "@xmldom/xmldom";

describe("MetadataExtractor", () => {
    let metadataExtractor;
    beforeEach(() => {
        metadataExtractor = MetadataExtractor.getInstance();
    });
    describe("extractFedoraDetails", () => {
        it("extracts details from RDF", () => {
            const rdf = `
                <rdf:RDF
                    xmlns:dcterms="http://purl.org/dc/terms/"
                    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                    xmlns:j.0="info:fedora/fedora-system:def/relations-external#"
                    xmlns:j.1="http://vudl.org/relationships#"
                    xmlns:fedora="http://fedora.info/definitions/v4/repository#"
                    xmlns:ldp="http://www.w3.org/ns/ldp#"
                    xmlns:j.2="info:fedora/fedora-system:def/model#" >
                <rdf:Description rdf:about="http://localhost:8080/rest/vudl:700048">
                    <j.2:hasModel rdf:resource="http://localhost:8080/rest/vudl-system:CollectionModel"/>
                    <j.2:label>Document List</j.2:label>
                    <ldp:contains rdf:resource="http://localhost:8080/rest/vudl:700048/DC"/>
                    <fedora:lastModified rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">2022-03-17T17:22:17.813586Z</fedora:lastModified>
                    <dcterms:title>Document List</dcterms:title>
                    <rdf:type rdf:resource="http://www.w3.org/ns/ldp#RDFSource"/>
                    <j.2:state>Inactive</j.2:state>
                    <j.1:sortOn>custom</j.1:sortOn>
                    <fedora:created rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">2022-03-17T17:22:17.148516Z</fedora:created>
                    <rdf:type rdf:resource="http://www.w3.org/ns/ldp#Resource"/>
                    <j.2:hasModel rdf:resource="http://localhost:8080/rest/vudl-system:CoreModel"/>
                    <j.0:isMemberOf rdf:resource="http://localhost:8080/rest/vudl:700047"/>
                    <rdf:type rdf:resource="http://fedora.info/definitions/v4/repository#Container"/>
                    <j.2:ownerId>diglibEditor</j.2:ownerId>
                    <rdf:type rdf:resource="http://www.w3.org/ns/ldp#Container"/>
                    <rdf:type rdf:resource="http://fedora.info/definitions/v4/repository#Resource"/>
                    <j.2:hasModel rdf:resource="http://localhost:8080/rest/vudl-system:ListCollection"/>
                    <rdf:type rdf:resource="http://www.w3.org/ns/ldp#BasicContainer"/>
                </rdf:Description>
                </rdf:RDF>
            `;
            expect(metadataExtractor.extractFedoraDetails(rdf)).toEqual({
                createdDate: ["2022-03-17T17:22:17.148516Z"],
                hasModel: [
                    "http://localhost:8080/rest/vudl-system:CollectionModel",
                    "http://localhost:8080/rest/vudl-system:CoreModel",
                    "http://localhost:8080/rest/vudl-system:ListCollection",
                ],
                isMemberOf: ["http://localhost:8080/rest/vudl:700047"],
                label: ["Document List"],
                lastModifiedDate: ["2022-03-17T17:22:17.813586Z"],
                ownerId: ["diglibEditor"],
                sortOn: ["custom"],
                state: ["Inactive"],
                type: [
                    "http://www.w3.org/ns/ldp#RDFSource",
                    "http://www.w3.org/ns/ldp#Resource",
                    "http://fedora.info/definitions/v4/repository#Container",
                    "http://www.w3.org/ns/ldp#Container",
                    "http://fedora.info/definitions/v4/repository#Resource",
                    "http://www.w3.org/ns/ldp#BasicContainer",
                ],
            });
        });
    });
    describe("extractEbuCore", () => {
        let xml;
        let xpathQuery;
        let rdfXml;
        let parseFromStringSpy;
        beforeEach(() => {
            xml = "test1";
            xpathQuery = "test2";
            rdfXml = "test3";
            parseFromStringSpy = jest.spyOn(DOMParser.prototype, "parseFromString");
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("extracts an ebu node", async () => {
            parseFromStringSpy.mockReturnValue(rdfXml);
            const extractRDFXMLSpy = jest.spyOn(metadataExtractor, "extractRDFXML").mockReturnValue({
                test: ["test4"],
            });

            const response = metadataExtractor.extractEbuCore(xml, xpathQuery);

            expect(parseFromStringSpy).toHaveBeenCalledWith(xml, "text/xml");
            expect(extractRDFXMLSpy).toHaveBeenCalled();
            expect(response).toEqual({
                test: ["test4"],
            });
        });
    });

    describe("getAges", () => {
        let xml;
        let xpathQuery;
        let rdfXml;
        let parseFromStringSpy;
        beforeEach(() => {
            xml = "test1";
            xpathQuery = "test2";
            rdfXml = "test3";
            parseFromStringSpy = jest.spyOn(DOMParser.prototype, "parseFromString");
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("gets the datastream agents", async () => {
            parseFromStringSpy.mockReturnValue(rdfXml);
            const extractRDFXMLSpy = jest.spyOn(metadataExtractor, "extractRDFXML").mockReturnValue({
                test: ["test4"],
            });

            const response = metadataExtractor.extractEbuCore(xml, xpathQuery);

            expect(parseFromStringSpy).toHaveBeenCalledWith(xml, "text/xml");
            expect(extractRDFXMLSpy).toHaveBeenCalled();
            expect(response).toEqual({
                test: ["test4"],
            });
        });
    });
});
