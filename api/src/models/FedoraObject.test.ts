import { FedoraObject } from "./FedoraObject";
import { Fedora } from "../services/Fedora";
import * as fs from "fs";
import Config from "../models/Config";

jest.mock("fs");

describe("FedoraObject", () => {
    let fedoraObject: FedoraObject;
    let pid: string;
    let buffer: Buffer;
    let filename: string;
    let stream: string;
    let mimeType: string;
    beforeEach(() => {
        buffer = Buffer.alloc(1024);
        pid = "testPid";
        filename = "test1";
        stream = "test2";
        mimeType = "test3";
        jest.spyOn(fs, "readFileSync").mockReturnValue(buffer);
        jest.spyOn(Config, "getInstance").mockReturnValue(null);
        fedoraObject = FedoraObject.build(pid);
    });

    describe("updateDatastreamFromFile", () => {
        let addDatastreamFromStringOrBufferSpy;
        it("updates datastream and tracks status 201 and 204", async () => {
            addDatastreamFromStringOrBufferSpy = jest.spyOn(fedoraObject, "addDatastreamFromStringOrBuffer");
            addDatastreamFromStringOrBufferSpy.mockResolvedValue({});

            await fedoraObject.updateDatastreamFromFile(filename, stream, mimeType);

            expect(fs.readFileSync).toHaveBeenCalledWith(filename);
            expect(addDatastreamFromStringOrBufferSpy).toHaveBeenCalledWith(buffer, stream, mimeType, [201, 204]);
        });
    });

    describe("deleteDatastream", () => {
        let deleteDatastreamSpy;
        let deleteDatastreamTombstoneSpy;
        it("deletes datastream and tombstone", async () => {
            deleteDatastreamSpy = jest.spyOn(Fedora.prototype, "deleteDatastream").mockImplementation(jest.fn());
            deleteDatastreamTombstoneSpy = jest
                .spyOn(Fedora.prototype, "deleteDatastreamTombstone")
                .mockImplementation(jest.fn());

            await fedoraObject.deleteDatastream(stream);

            expect(deleteDatastreamSpy).toHaveBeenCalledWith(pid, stream);
            expect(deleteDatastreamTombstoneSpy).toHaveBeenCalledWith(pid, stream);
        });
    });

    describe("deleteDatastreamTombstone", () => {
        let deleteDatastreamTombstoneSpy;
        it("deletes tombstone", async () => {
            deleteDatastreamTombstoneSpy = jest
                .spyOn(Fedora.prototype, "deleteDatastreamTombstone")
                .mockImplementation(jest.fn());

            await fedoraObject.deleteDatastreamTombstone(stream);

            expect(deleteDatastreamTombstoneSpy).toHaveBeenCalledWith(pid, stream);
        });
    });
});
