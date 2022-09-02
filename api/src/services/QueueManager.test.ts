import QueueManager from "./QueueManager";
import { Queue } from "bullmq";

let workerArgs;
function workerConstructor(...args) {
    workerArgs = args;
}
jest.mock("bullmq", () => {
    return {
        Queue: jest.fn(),
        Worker: jest.fn().mockImplementation(workerConstructor),
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
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("buildDerivatives", () => {
        let addSpy;
        beforeEach(() => {
            addSpy = jest.spyOn(Queue.prototype, "add").mockImplementation(jest.fn());
        });

        it("queues a job appropriately", async () => {
            await queueManager.buildDerivatives("foo");
            expect(addSpy).toHaveBeenCalledWith("derivatives", { dir: "foo" });
        });
    });

    describe("ingestJob", () => {
        let addSpy;
        beforeEach(() => {
            addSpy = jest.spyOn(Queue.prototype, "add").mockImplementation(jest.fn());
        });

        it("queues a job appropriately", async () => {
            await queueManager.ingestJob("foo");
            expect(addSpy).toHaveBeenCalledWith("ingest", { dir: "foo" });
        });
    });

    describe("generatePdf", () => {
        let addSpy;
        beforeEach(() => {
            addSpy = jest.spyOn(Queue.prototype, "add").mockImplementation(jest.fn());
        });

        it("queues a job appropriately", async () => {
            await queueManager.generatePdf("foo");
            expect(addSpy).toHaveBeenCalledWith("generatepdf", { pid: "foo" });
        });
    });

    describe("getWorker", () => {
        it("will return a correctly configured worker", () => {
            const callback = jest.fn();
            queueManager.getWorker(callback);
            expect(workerArgs[0]).toEqual("vudl");
            expect(workerArgs[1]).toEqual(callback);
            expect(workerArgs[2]).toEqual({
                connection: { host: "localhost", port: "6379" },
                lockDuration: 30000,
            });
        });
    });

    describe("performIndexOperation", () => {
        let jobs;
        let getJobsSpy;
        let addSpy;
        beforeEach(() => {
            jobs = [];
            getJobsSpy = jest.spyOn(Queue.prototype, "getJobs").mockResolvedValue(jobs);
            addSpy = jest.spyOn(Queue.prototype, "add").mockImplementation(jest.fn());
        });

        it("will not queue an index operation if it already exists (by default)", async () => {
            jobs.push({
                name: "index",
                data: {
                    pid: "123",
                    action: "index",
                },
            });
            const consoleSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
            await queueManager.performIndexOperation("123", "index");
            expect(addSpy).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith("Skipping queue; 123 is already awaiting index.");
        });

        it("will queue an index operation if it already exists if you force it", async () => {
            jobs.push({
                name: "index",
                data: {
                    pid: "123",
                    action: "index",
                },
            });
            await queueManager.performIndexOperation("123", "index", true);
            expect(addSpy).toHaveBeenCalledWith("index", { pid: "123", action: "index" });
        });

        it("will queue an index operation", async () => {
            await queueManager.performIndexOperation("123", "index");

            expect(getJobsSpy).toHaveBeenCalledWith("wait");
            expect(addSpy).toHaveBeenCalledWith("index", { pid: "123", action: "index" });
        });
    });

    describe("queueMetadataOperation", () => {
        let jobs;
        let getJobsSpy;
        let addSpy;
        beforeEach(() => {
            jobs = [];
            getJobsSpy = jest.spyOn(Queue.prototype, "getJobs").mockResolvedValue(jobs);
            addSpy = jest.spyOn(Queue.prototype, "add").mockImplementation(jest.fn());
        });

        it("will not queue a metadata operation if it already exists (by default)", async () => {
            jobs.push({
                name: "metadata",
                data: {
                    pid: "123",
                    action: "add",
                },
            });
            const consoleSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
            await queueManager.queueMetadataOperation("123", "add");
            expect(addSpy).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith("Skipping queue; 123 is already awaiting add.");
        });

        it("will queue a metadata operation if it already exists if you force it", async () => {
            jobs.push({
                name: "metadata",
                data: {
                    pid: "123",
                    action: "add",
                },
            });
            await queueManager.queueMetadataOperation("123", "add", true);
            expect(addSpy).toHaveBeenCalledWith("metadata", { pid: "123", action: "add" });
        });

        it("will queue a metadata operation", async () => {
            await queueManager.queueMetadataOperation("123", "add");

            expect(getJobsSpy).toHaveBeenCalledWith("wait");
            expect(addSpy).toHaveBeenCalledWith("metadata", { pid: "123", action: "add" });
        });
    });
});
