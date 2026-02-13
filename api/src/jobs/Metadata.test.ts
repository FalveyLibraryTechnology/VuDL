import Metadata from "./Metadata";
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
        let contentFile;
        beforeEach(() => {
            contentFile = "test1";
            fedoraObject = {
                addMasterMetadataDatastream: jest.fn(),
                downloadDatastreamToTempFile: jest.fn(),
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
            fedoraObject.downloadDatastreamToTempFile.mockResolvedValue(contentFile);

            const consoleSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
            await metadata.run(job);
            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith("Adding metadata...", { pid: 123 });
            expect(fedoraObject.addMasterMetadataDatastream).toHaveBeenCalledWith(contentFile);
        });
    });
});
