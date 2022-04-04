import Metadata from "./Metadata";
import fs = require("fs");
import tmp = require("tmp");
import { Job } from "bullmq";
import { FedoraObject } from "../models/FedoraObject";

jest.mock("../models/FedoraObject");
jest.mock("../models/Config");
jest.mock("tmp");
jest.mock("fs");

describe("Metadata", () => {
    let metadata: Metadata;
    beforeEach(() => {
        metadata = new Metadata();
    });

    describe("run", () => {
        let job: Job;
        let fedoraObject;
        let dataStream: string;
        let contentFile;
        beforeEach(() => {
            contentFile = {
                name: "test1",
            };
            dataStream = "test2";
            fedoraObject = {
                addMasterMetadataDatastream: jest.fn(),
                getDatastreamAsBuffer: jest.fn(),
            };
            job = {
                data: {
                    pid: 123,
                },
            } as Job;
            jest.spyOn(FedoraObject, "build").mockReturnValue(fedoraObject);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("adds a master data stream", async () => {
            fedoraObject.getDatastreamAsBuffer.mockResolvedValue(dataStream);
            tmp.fileSync.mockReturnValue(contentFile);

            const consoleSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
            await metadata.run(job);
            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith("Adding metadata...", { pid: 123 });
            expect(fs.writeFileSync).toHaveBeenCalledWith(contentFile.name, dataStream);
            expect(fedoraObject.addMasterMetadataDatastream).toHaveBeenCalledWith(contentFile.name);
        });
    });
});
