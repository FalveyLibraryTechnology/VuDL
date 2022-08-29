import Config from "./Config";
import Job from "./Job";
import QueueManager from "../services/QueueManager";

jest.mock("./Config");
jest.mock("../services/QueueManager");

// We have an indirect dependency on ImageFile, but we don't really want
// to load it for the context of this test.
jest.mock("./ImageFile", () => {
    return {};
});

describe("Job", () => {
    let job: Job;

    beforeEach(() => {
        job = new Job("test1", new Config({}), new QueueManager());
    });

    it("should return the name", () => {
        expect(job.name).toEqual("test1");
    });
});
