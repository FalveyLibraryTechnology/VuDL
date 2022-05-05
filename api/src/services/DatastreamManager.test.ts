import FedoraCatalog from "./FedoraCatalog";
import { FedoraObject } from "../models/FedoraObject";
import MetadataExtractor from "./MetadataExtractor";
import DatastreamManager from "./DatastreamManager";
import Config from "../models/Config";

describe("DatastreamManager", () => {
    let config;
    let fedoraObjectBuildSpy;
    let modifyLicenseSpy;
    let getDatastreamSpy;
    let updateDatastreamFromFileSpy;
    let datastreamManager;
    let datastreamsSpy;
    beforeEach(() => {
        config = {
            licenses: {
                testLicenseKey: {
                    name: "testLicense",
                    uri: "testLicense.com",
                },
            },
        };
        jest.spyOn(Config, "getInstance").mockReturnValue(config);
        fedoraObjectBuildSpy = jest.spyOn(FedoraObject, "build");
        getDatastreamSpy = jest.spyOn(FedoraObject.prototype, "getDatastream");
        modifyLicenseSpy = jest.spyOn(FedoraObject.prototype, "modifyLicense");
        updateDatastreamFromFileSpy = jest.spyOn(FedoraObject.prototype, "updateDatastreamFromFile");
        datastreamsSpy = jest.spyOn(FedoraCatalog.prototype, "getDatastreamMimetypes");
        datastreamManager = DatastreamManager.getInstance();
    });

    describe("hasValidMimeType", () => {
        beforeEach(() => {
            datastreamsSpy.mockReturnValue({
                WAV: {
                    mimetype: {
                        allowedType: "test1",
                        allowedSubtypes: "test2,test3,test4",
                    },
                },
                THUMBNAIL: {
                    mimetype: {
                        allowedType: "*",
                        allowedSubtypes: "test2,test3,test4",
                    },
                },
                MEDIUM: {
                    mimetype: {
                        allowedType: "test1",
                        allowedSubtypes: "*",
                    },
                },
                NOTYPES: {
                    mimetype: {},
                },
                NOMIMETYPE: {},
            });
        });

        it("returns false when subtype does not exist", () => {
            expect(datastreamManager.hasValidMimeType("WAV", "test1/test5")).toBeFalsy();
        });

        it("returns false when type does not exist", () => {
            expect(datastreamManager.hasValidMimeType("WAV", "test5/test2")).toBeFalsy();
        });

        it("returns false when mimetype does not follow pattern", () => {
            expect(datastreamManager.hasValidMimeType("WAV", "test1/test2/test3")).toBeFalsy();
        });

        it("returns false when allowedType/allowedSubtypes does not exist", () => {
            expect(datastreamManager.hasValidMimeType("NOTYPES", "test1/test2")).toBeFalsy();
        });

        it("returns false when mimetype does not exist", () => {
            expect(datastreamManager.hasValidMimeType("NOMIMETYPE", "test1/test2")).toBeFalsy();
        });

        it("returns true when type/subtype does exist", () => {
            expect(datastreamManager.hasValidMimeType("WAV", "test1/test2")).toBeTruthy();
        });

        it("returns true for any type", () => {
            expect(datastreamManager.hasValidMimeType("THUMBNAIL", "anythingreally/test2")).toBeTruthy();
        });

        it("returns true for any subtype", () => {
            expect(datastreamManager.hasValidMimeType("MEDIUM", "test1/anythingworks")).toBeTruthy();
        });
    });

    describe("getMetadata", () => {
        let getDatastreamMetadataSpy;
        let pid;
        let stream;
        let xml;

        beforeEach(() => {
            pid = "test1";
            stream = "test2";
            xml = "test3";
            getDatastreamMetadataSpy = jest.spyOn(FedoraObject.prototype, "getDatastreamMetadata");
        });

        it("gets the datastream metadata", async () => {
            getDatastreamMetadataSpy.mockResolvedValue(xml);
            const metadata = await datastreamManager.getMetadata(pid, stream);

            expect(fedoraObjectBuildSpy).toHaveBeenCalledWith(pid);
            expect(metadata).toEqual(xml);
            expect(getDatastreamMetadataSpy).toHaveBeenCalledWith(stream);
        });
    });

    describe("getMimeType", () => {
        let getMetadataSpy;
        let extractEbuNodeSpy;
        let pid;
        let stream;
        let xml;
        let mimeType;

        beforeEach(() => {
            pid = "test1";
            stream = "test2";
            xml = "test3";
            mimeType = "test4";
            getMetadataSpy = jest.spyOn(datastreamManager, "getMetadata");
            extractEbuNodeSpy = jest.spyOn(MetadataExtractor.prototype, "extractEbuCore");
        });

        it("gets the datastream metadata", async () => {
            getMetadataSpy.mockResolvedValue(xml);
            extractEbuNodeSpy.mockReturnValue({
                hasMimeType: [mimeType],
            });

            expect(await datastreamManager.getMimeType(pid, stream)).toEqual(mimeType);

            expect(fedoraObjectBuildSpy).toHaveBeenCalledWith(pid);
            expect(getMetadataSpy).toHaveBeenCalledWith(pid, stream);
            expect(extractEbuNodeSpy).toHaveBeenCalledWith(xml, "//ebucore:hasMimeType");
        });
    });

    describe("downloadBuffer", () => {
        let getDatastreamAsBufferSpy;
        let pid;
        let stream;
        let buffer;

        beforeEach(() => {
            pid = "test1";
            stream = "test2";
            buffer = "test3";
            getDatastreamAsBufferSpy = jest.spyOn(FedoraObject.prototype, "getDatastreamAsBuffer");
        });

        it("gets the datastream as a buffer", async () => {
            getDatastreamAsBufferSpy.mockResolvedValue(buffer);
            const response = await datastreamManager.downloadBuffer(pid, stream);

            expect(fedoraObjectBuildSpy).toHaveBeenCalledWith(pid);
            expect(response).toEqual(buffer);
            expect(getDatastreamAsBufferSpy).toHaveBeenCalledWith(stream);
        });
    });

    describe("uploadFile", () => {
        let hasValidMimeTypeSpy;
        let pid;
        let stream;
        let filepath;
        let mimeType;
        beforeEach(() => {
            pid = "test1";
            stream = "test2";
            filepath = "test3";
            mimeType = "test4";
            hasValidMimeTypeSpy = jest.spyOn(datastreamManager, "hasValidMimeType");
        });

        it("calls updateDataStreamFromFile when mime type is valid", async () => {
            updateDatastreamFromFileSpy.mockResolvedValue(false);
            hasValidMimeTypeSpy.mockReturnValue(true);

            await datastreamManager.uploadFile(pid, stream, filepath, mimeType);

            expect(fedoraObjectBuildSpy).toHaveBeenCalledWith(pid);
            expect(hasValidMimeTypeSpy).toHaveBeenCalledWith(stream, mimeType);
            expect(updateDatastreamFromFileSpy).toHaveBeenCalledWith(filepath, stream, mimeType);
        });

        it("throws an error when mime type is invalid", async () => {
            hasValidMimeTypeSpy.mockReturnValue(false);
            expect(datastreamManager.uploadFile(pid, stream, filepath, mimeType)).rejects.toThrowError(
                "Invalid mime type: " + mimeType
            );
        });
    });

    describe("uploadLicense", () => {
        let pid;
        let stream;
        let licenseKey;
        beforeEach(() => {
            pid = "test1";
            stream = "test2";
            licenseKey = "testLicenseKey";
        });

        it("calls uploadLicense with success", async () => {
            modifyLicenseSpy.mockResolvedValue("");

            await datastreamManager.uploadLicense(pid, stream, licenseKey);

            expect(fedoraObjectBuildSpy).toHaveBeenCalledWith(pid);
            expect(modifyLicenseSpy).toHaveBeenCalledWith(stream, licenseKey);
        });
    });

    describe("getLicenseKey", () => {
        let pid;
        let stream;
        let extractLicenseSpy;
        beforeEach(() => {
            pid = "test1";
            stream = "test2";
            extractLicenseSpy = jest.spyOn(MetadataExtractor.prototype, "extractLicense");
        });

        it("returns a licenseKey", async () => {
            getDatastreamSpy.mockReturnValue("testXml");
            extractLicenseSpy.mockReturnValue("testLicense.com");

            const response = await datastreamManager.getLicenseKey(pid, stream);

            expect(fedoraObjectBuildSpy).toHaveBeenCalledWith(pid);
            expect(getDatastreamSpy).toHaveBeenCalledWith(stream);
            expect(extractLicenseSpy).toHaveBeenCalledWith("testXml");
            expect(response).toEqual("testLicenseKey");
        });

        it("returns an empty string when an unrecognized URI is provided", async () => {
            getDatastreamSpy.mockReturnValue("testXml");
            extractLicenseSpy.mockReturnValue("notALicense");

            const response = await datastreamManager.getLicenseKey(pid, stream);

            expect(fedoraObjectBuildSpy).toHaveBeenCalledWith(pid);
            expect(getDatastreamSpy).toHaveBeenCalledWith(stream);
            expect(extractLicenseSpy).toHaveBeenCalledWith("testXml");
            expect(response).toEqual("");
        });
    });

    describe("deleteDatastream", () => {
        let deleteDatastreamSpy;
        let pid;
        let stream;
        beforeEach(() => {
            pid = "test1";
            stream = "test2";
            deleteDatastreamSpy = jest.spyOn(FedoraObject.prototype, "deleteDatastream");
        });

        it("deletes the datastream", async () => {
            deleteDatastreamSpy.mockResolvedValue({});

            await datastreamManager.deleteDatastream(pid, stream);

            expect(fedoraObjectBuildSpy).toHaveBeenCalledWith(pid);
            expect(deleteDatastreamSpy).toHaveBeenCalledWith(stream);
        });
    });
});
