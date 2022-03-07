import { FedoraObject } from "./FedoraObject";
import * as fs from "fs";
import Config from "../models/Config";

jest.mock("fs");

describe("FedoraObject", () => {
    let fedoraObject: FedoraObject;
    let buffer: Buffer;
    let filename: string;
    let stream: string;
    let mimeType: string;
    beforeEach(() => {
        buffer = Buffer.alloc(1024);
        filename = "test1";
        stream = "test2";
        mimeType = "test3";
        jest.spyOn(fs, "readFileSync").mockReturnValue(buffer);
        jest.spyOn(Config, "getInstance").mockReturnValue(null);
        fedoraObject = FedoraObject.build("test1");
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
});
