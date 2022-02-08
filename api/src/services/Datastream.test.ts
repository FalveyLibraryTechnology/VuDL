import FedoraCatalog from "./FedoraCatalog";
import { FedoraObject } from "../models/FedoraObject";
import Datastream from "./Datastream";

describe("Datastream", () => {
    let updateDatastreamFromFileSpy;
    let datastream;
    let datastreamsSpy;
    beforeEach(() => {
        updateDatastreamFromFileSpy = jest.spyOn(FedoraObject.prototype, "updateDatastreamFromFile");
        datastreamsSpy = jest.spyOn(FedoraCatalog.prototype, "getDatastreamMimetypes");
        datastream = Datastream.getInstance();
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
            });
        });

        it("returns false when subtype does not exist", () => {
            expect(datastream.hasValidMimeType("WAV", "test1/test5")).toBeFalsy();
        });

        it("returns false when type does not exist", () => {
            expect(datastream.hasValidMimeType("WAV", "test5/test2")).toBeFalsy();
        });

        it("returns true when type/subtype does exist", () => {
            expect(datastream.hasValidMimeType("WAV", "test1/test2")).toBeTruthy();
        });

        it("returns true for any type", () => {
            expect(datastream.hasValidMimeType("WAV", "test1/test2")).toBeTruthy();
        });

        it("returns true for any type", () => {
            expect(datastream.hasValidMimeType("THUMBNAIL", "anythingreally/test2")).toBeTruthy();
        });

        it("returns true for any subtype", () => {
            expect(datastream.hasValidMimeType("MEDIUM", "test1/anythingworks")).toBeTruthy();
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
            hasValidMimeTypeSpy = jest.spyOn(datastream, "hasValidMimeType");
        });

        it("calls updateDataStreamFromFile when mime type is valid", async () => {
            updateDatastreamFromFileSpy.mockResolvedValue(false);
            hasValidMimeTypeSpy.mockReturnValue(true);

            await datastream.uploadFile(pid, stream, filepath, mimeType);

            expect(hasValidMimeTypeSpy).toHaveBeenCalledWith(stream, mimeType);
            expect(updateDatastreamFromFileSpy).toHaveBeenCalledWith(filepath, stream, mimeType);
        });

        it("throws an error when mime type is invalid", async () => {
            hasValidMimeTypeSpy.mockReturnValue(false);
            expect(datastream.uploadFile(pid, stream, filepath, mimeType)).rejects.toThrowError("Invalid mime types");
        });
    });
});
