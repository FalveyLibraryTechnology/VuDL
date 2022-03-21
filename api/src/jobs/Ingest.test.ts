import Config from "../models/Config";
import Job from "../models/Job";
import { FedoraObject } from "../models/FedoraObject";
import Fedora from "../services/Fedora";
import FedoraObjectFactory from "../services/FedoraObjectFactory";
import { IngestProcessor } from "./Ingest";
import QueueManager from "../services/QueueManager";
import winston = require("winston");

// We have an indirect dependency on ImageFile, but we don't really want
// to load it for the context of this test.
jest.mock("../models/ImageFile.ts", () => {
    return {};
});

describe("IngestProcessor", () => {
    let ingest: IngestProcessor;
    let config: Config;
    let logger: winston.Logger;
    let dir: string;
    let jobName: string;
    let fedora: Fedora;
    let job: Job;
    beforeEach(() => {
        dir = "/my/fake/dir";
        jobName = "fakejob";
        config = new Config({});
        logger = winston.createLogger({
            level: "error", // we don't want to see info messages while testing
            transports: [new winston.transports.Console()],
        });
        fedora = new Fedora(config);
        job = new Job(dir + "/" + jobName, config, new QueueManager());
        jest.spyOn(Job, "build").mockReturnValue(job);
        ingest = new IngestProcessor(dir, config, new FedoraObjectFactory(config), logger);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("finalizeTitle", () => {
        it("creates a title based on the directory path", async () => {
            const fedoraObject = new FedoraObject("foo:123", config, fedora);
            const labelSpy = jest.spyOn(fedoraObject, "modifyObjectLabel").mockImplementation(jest.fn());
            const datastreamSpy = jest
                .spyOn(fedoraObject, "getDatastream")
                .mockResolvedValue("<oai:dc><dc:title>Incomplete... / Processing...</dc:title></oai:dc>");
            const replaceSpy = jest.spyOn(ingest, "replaceDCMetadata").mockImplementation(jest.fn());
            await ingest.finalizeTitle(fedoraObject);
            expect(labelSpy).toHaveBeenCalledTimes(1);
            expect(labelSpy).toHaveBeenCalledWith("fakejob_dir_fake_my");
            expect(datastreamSpy).toHaveBeenCalledTimes(1);
            expect(datastreamSpy).toHaveBeenCalledWith("DC");
            expect(replaceSpy).toHaveBeenCalledTimes(1);
            expect(replaceSpy).toHaveBeenCalledWith(
                fedoraObject,
                "<oai:dc><dc:title>fakejob_dir_fake_my</dc:title></oai:dc>",
                "Set dc:title to ingest/process path"
            );
        });
    });
});
