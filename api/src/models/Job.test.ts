import Job from "./Job";
import Config from "../models/Config";
import QueueManager from "../services/QueueManager";

//jest.mock("../models/Config");
//jest.mock("../services/QueueManager");

describe("Job", () => {
    let job: Job;
    //let config;
    //let queueManager;
    beforeEach(() => {
        //use later
        //config = { };
        //queueManager = { };
        //jest.spyOn(Config, "getInstance").mockReturnValue(config);
        //jest.spyOn(QueueManager, "getInstance").mockReturnValue(queueManager);
        //job = new Job("test1", config, queueManager);
    });

    it("should return the name", () => {
        expect(job.name).toEqual("test1");
    });
});
