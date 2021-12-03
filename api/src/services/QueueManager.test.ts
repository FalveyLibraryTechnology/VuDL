import QueueManager from "./QueueManager";
import { Queue } from "bullmq";

jest.mock("bullmq");

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

        it("will not queue a metadata operation if it already exists", async () => {
            jobs.push({
                name: "metadata",
                data: {
                    pid: "123",
                    action: "add",
                },
            });

            await queueManager.queueMetadataOperation("123", "add");
            expect(addSpy).not.toHaveBeenCalledWith("metadata", { pid: "123", action: "add" });
        });

        it("will queue a metadata operation", async () => {
            await queueManager.queueMetadataOperation("123", "add");

            expect(getJobsSpy).toHaveBeenCalledWith("wait");
            expect(addSpy).toHaveBeenCalledWith("metadata", { pid: "123", action: "add" });
        });
    });
});
