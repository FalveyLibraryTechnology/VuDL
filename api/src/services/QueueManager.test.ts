import QueueManager from "./QueueManager";
import { Queue } from "bullmq";

jest.mock("bullmq", () => {
    return {
        Queue: jest.fn(),
    };
});
Queue.prototype.add = jest.fn();
Queue.prototype.close = jest.fn();
Queue.prototype.getJobs = jest.fn();

describe("QueueManager", () => {
    let queueManager;
    beforeEach(() => {
        queueManager = QueueManager.getInstance();
    });

    describe("queueMetadataOperation", () => {
        let jobs;
        let getJobsSpy;
        let addSpy;
        beforeEach(() => {
            jobs = [];
            getJobsSpy = jest.spyOn(Queue.prototype, "getJobs").mockResolvedValue(jobs);
            addSpy = jest.spyOn(Queue.prototype, "add");
        });
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("will not queue a metadata operation if it already exists", async () => {
            jobs.push({
                name: "metadata",
                data: {
                    pid: "123",
                    action: "add",
                },
            });
            const consoleSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
            await queueManager.queueMetadataOperation("123", "add");
            expect(addSpy).not.toHaveBeenCalledWith("metadata", { pid: "123", action: "add" });
            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith("Skipping queue; 123 is already awaiting add.");
        });

        it("will queue a metadata operation", async () => {
            await queueManager.queueMetadataOperation("123", "add");

            expect(getJobsSpy).toHaveBeenCalledWith("wait");
            expect(addSpy).toHaveBeenCalledWith("metadata", { pid: "123", action: "add" });
        });
    });
});
