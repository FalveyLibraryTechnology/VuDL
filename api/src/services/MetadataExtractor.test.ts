import MetadataExtractor from "./MetadataExtractor";
import { DOMParser } from "@xmldom/xmldom";

describe("MetadataExtractor", () => {
    let metadataExtractor;
    beforeEach(() => {
        metadataExtractor = MetadataExtractor.getInstance();
    });

    describe("getProcessMetadata", () => {
        it("extracts details from XML", () => {
            const xml = `
                            <?xml version="1.0" encoding="UTF-8"?>
                            <DIGIPROVMD:DIGIPROVMD xmlns:DIGIPROVMD="http://www.loc.gov/PMD">
                                <DIGIPROVMD:task ID="1">
                                    <DIGIPROVMD:task_label>task label 1</DIGIPROVMD:task_label>
                                    <DIGIPROVMD:task_description>task desc 1</DIGIPROVMD:task_description>
                                    <DIGIPROVMD:task_sequence>1</DIGIPROVMD:task_sequence>
                                    <DIGIPROVMD:task_individual>task indiv 1</DIGIPROVMD:task_individual>
                                    <DIGIPROVMD:tool>
                                    <DIGIPROVMD:tool_label>Photoshop</DIGIPROVMD:tool_label>
                                    <DIGIPROVMD:tool_description>desc 1</DIGIPROVMD:tool_description>
                                    <DIGIPROVMD:tool_make>Adobe</DIGIPROVMD:tool_make>
                                    <DIGIPROVMD:tool_version>CS2</DIGIPROVMD:tool_version>
                                    <DIGIPROVMD:tool_serial_number>sn1</DIGIPROVMD:tool_serial_number>
                                    </DIGIPROVMD:tool>
                                </DIGIPROVMD:task>
                                <DIGIPROVMD:task ID="2">
                                    <DIGIPROVMD:task_label>task label 2</DIGIPROVMD:task_label>
                                    <DIGIPROVMD:task_description>task desc 2</DIGIPROVMD:task_description>
                                    <DIGIPROVMD:task_sequence>1</DIGIPROVMD:task_sequence>
                                    <DIGIPROVMD:task_individual>task indiv 2</DIGIPROVMD:task_individual>
                                    <DIGIPROVMD:tool>
                                    <DIGIPROVMD:tool_label>Indus 5005 MAX LARGE FORMAT BOOK SCANNER</DIGIPROVMD:tool_label>
                                    <DIGIPROVMD:tool_description>desc 2</DIGIPROVMD:tool_description>
                                    <DIGIPROVMD:tool_make>ImageWare</DIGIPROVMD:tool_make>
                                    <DIGIPROVMD:tool_version>LF-00207</DIGIPROVMD:tool_version>
                                    <DIGIPROVMD:tool_serial_number>LF-00207</DIGIPROVMD:tool_serial_number>
                                    </DIGIPROVMD:tool>
                                </DIGIPROVMD:task>
                                <DIGIPROVMD:process_creator>first</DIGIPROVMD:process_creator>
                                <DIGIPROVMD:process_datetime>2022-10-05T07:00:00</DIGIPROVMD:process_datetime>
                                <DIGIPROVMD:process_label>Digitize Original Item</DIGIPROVMD:process_label>
                                <DIGIPROVMD:process_organization>Falvey Memorial Library, Villanova University</DIGIPROVMD:process_organization>
                            </DIGIPROVMD:DIGIPROVMD>
                        `;
            expect(metadataExtractor.getProcessMetadata(xml)).toEqual({
                processCreator: "first",
                processDateTime: "2022-10-05T07:00:00",
                processLabel: "Digitize Original Item",
                processOrganization: "Falvey Memorial Library, Villanova University",
                tasks: [
                    {
                        description: "task desc 1",
                        id: "1",
                        individual: "task indiv 1",
                        label: "task label 1",
                        sequence: "1",
                        toolDescription: "desc 1",
                        toolLabel: "Photoshop",
                        toolMake: "Adobe",
                        toolSerialNumber: "sn1",
                        toolVersion: "CS2",
                    },
                    {
                        description: "task desc 2",
                        id: "2",
                        individual: "task indiv 2",
                        label: "task label 2",
                        sequence: "1",
                        toolDescription: "desc 2",
                        toolLabel: "Indus 5005 MAX LARGE FORMAT BOOK SCANNER",
                        toolMake: "ImageWare",
                        toolSerialNumber: "LF-00207",
                        toolVersion: "LF-00207",
                    },
                ],
            });
        });
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
