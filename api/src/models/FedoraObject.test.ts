import { FedoraObject } from "./FedoraObject";
import { Fedora } from "../services/Fedora";
import FedoraDataCollector from "../services/FedoraDataCollector";
import FedoraDataCollection from "./FedoraDataCollection";
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
        Config.setInstance(new Config({}));
        fedoraObject = FedoraObject.build(pid);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("addRelationship", () => {
        it("proxies a call to the fedora service", () => {
            const fedora = Fedora.getInstance();
            const spy = jest.spyOn(fedora, "addRelationship").mockImplementation(jest.fn());
            fedoraObject = FedoraObject.build(pid);
            fedoraObject.addRelationship("subject", "predicate", "object", true);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(pid, "subject", "predicate", "object", true);
        });
    });

    describe("getSortOn", () => {
        it("defaults to title", async () => {
            const fedora = Fedora.getInstance();
            jest.spyOn(fedora, "getDublinCore").mockResolvedValue(null);
            jest.spyOn(fedora, "getRdf").mockResolvedValue("<rdf />");
            fedoraObject = FedoraObject.build(pid);
            expect(await fedoraObject.getSortOn()).toEqual("title");
        });

        it("uses the data collector to obtain sort data", async () => {
            const collector = FedoraDataCollector.getInstance();
            const collection = FedoraDataCollection.build(pid, {}, { sortOn: ["custom"] });
            const collectorSpy = jest.spyOn(collector, "getObjectData").mockResolvedValue(collection);
            fedoraObject = FedoraObject.build(pid);
            expect(await fedoraObject.getSortOn()).toEqual("custom");
            expect(collectorSpy).toHaveBeenCalledTimes(1);
            expect(collectorSpy).toHaveBeenCalledWith(pid);
        });
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

    describe("getDatastreamMetadata", () => {
        let getRdfSpy;
        it("gets the datastream metadata", async () => {
            getRdfSpy = jest.spyOn(Fedora.getInstance(), "getRdf").mockResolvedValue("test");

            const metadata = await fedoraObject.getDatastreamMetadata(stream);

            expect(metadata).toEqual("test");
            expect(getRdfSpy).toHaveBeenCalledWith(`${pid}/${stream}/fcr:metadata`);
        });
    });

    describe("deleteDatastream", () => {
        let deleteDatastreamSpy;
        let deleteDatastreamTombstoneSpy;
        it("deletes datastream and tombstone", async () => {
            deleteDatastreamSpy = jest.spyOn(Fedora.getInstance(), "deleteDatastream").mockImplementation(jest.fn());
            deleteDatastreamTombstoneSpy = jest
                .spyOn(Fedora.getInstance(), "deleteDatastreamTombstone")
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
                .spyOn(Fedora.getInstance(), "deleteDatastreamTombstone")
                .mockImplementation(jest.fn());

            await fedoraObject.deleteDatastreamTombstone(stream);

            expect(deleteDatastreamTombstoneSpy).toHaveBeenCalledWith(pid, stream);
        });
    });
});
