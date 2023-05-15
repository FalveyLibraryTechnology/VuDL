import fs = require("fs");
import Config from "./Config";
import Job from "./Job";
import JobMetadata from "./JobMetadata";
import QueueManager from "../services/QueueManager";
import VideoOrder from "./VideoOrder";

jest.mock("./Config");
jest.mock("../services/QueueManager");

// We have an indirect dependency on ImageFile, but we don't really want
// to load it for the context of this test.
jest.mock("./ImageFile", () => {
    return {};
});

describe("JobMetadata", () => {
    let config: Config;
    let job: Job;
    let jobMetadata: JobMetadata;

    beforeEach(() => {
        config = new Config({});
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

    it("automatically creates a video order as needed", () => {
        expect(jobMetadata.video.raw()).toEqual([]);
    });

    it("allows setting of a video list", () => {
        const video = new VideoOrder([]);
        jobMetadata.video = video;
        expect(jobMetadata.video).toEqual(video);
    });

    it("allows setting of a video list from raw data", () => {
        const video = [{ filename: "a.avi" }];
        jobMetadata.setVideoFromRaw(video);
        expect(jobMetadata.video.raw()).toEqual(video);
    });
});
