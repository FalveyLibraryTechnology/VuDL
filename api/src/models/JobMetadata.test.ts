import fs = require("fs");
import Config from "./Config";
import Job from "./Job";
import JobMetadata from "./JobMetadata";
import QueueManager from "../services/QueueManager";

jest.mock("./Config");
jest.mock("../services/QueueManager");

// We have an indirect dependency on ImageFile, but we don't really want
// to load it for the context of this test.
jest.mock("./ImageFile", () => {
    return {};
});

describe("JobMetadata", () => {
    let job: Job;
    let jobMetadata: JobMetadata;

    beforeEach(() => {
        const config = new Config({});
        job = new Job("test1", config, new QueueManager(config));
        jobMetadata = new JobMetadata(job);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("provides Dublin Core when it exists", () => {
        const filename = "test1/dc.xml";
        const existsSpy = jest.spyOn(fs, "existsSync").mockReturnValue(true);
        const readSpy = jest.spyOn(fs, "readFileSync").mockReturnValue(Buffer.from("foo"));
        expect(jobMetadata.dublinCore).toEqual("foo");
        expect(existsSpy).toHaveBeenCalledWith(filename);
        expect(readSpy).toHaveBeenCalledWith(filename);
    });
});
