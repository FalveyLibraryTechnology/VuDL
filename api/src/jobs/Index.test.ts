import Index from "./Index";
import { Job } from "bullmq";
import { NeedleResponse } from "../services/interfaces";
import Config from "../models/Config";
import QueueManager from "../services/QueueManager";
import SolrCache from "../services/SolrCache";
import SolrIndexer from "../services/SolrIndexer";

jest.mock("../services/SolrIndexer");

describe("Index", () => {
    let index: Index;
    beforeEach(() => {
        index = new Index();
    });

    describe("run", () => {
        let job: Job;
        let indexer;
        let needleResponse: NeedleResponse;
        let consoleErrorSpy;
        let consoleLogSpy;
        let sleepSpy;
        let unlockPidSpy;
        let queueSpy;

        beforeEach(() => {
            needleResponse = {
                statusCode: 200,
            } as NeedleResponse;
            indexer = {
                deletePid: jest.fn(),
                indexPid: jest.fn(),
                getLastIndexResults: jest.fn(),
            };
            job = {
                id: "1",
                data: {
                    action: "delete",
                    pid: "vudl:123",
                },
            } as Job;
            jest.spyOn(SolrIndexer, "getInstance").mockReturnValue(indexer);
            indexer.getLastIndexResults.mockReturnValue({ fedora_parent_id_str_mv: ["foo:1"] });
            queueSpy = jest.spyOn(QueueManager.getInstance(), "getActiveIndexJobsForPid").mockResolvedValue([job]);
            consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
            consoleLogSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
            unlockPidSpy = jest.spyOn(SolrCache.getInstance(), "unlockPidIfEnabled").mockImplementation(jest.fn());
            sleepSpy = jest.spyOn(index, "sleep").mockImplementation(jest.fn());
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("deletes the pid", async () => {
            jest.spyOn(indexer, "deletePid").mockResolvedValue(needleResponse);

            await index.run(job);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledWith("Indexing...", { action: "delete", pid: "vudl:123" });
            expect(indexer.deletePid).toHaveBeenCalledWith(job.data.pid);
            expect(unlockPidSpy).toHaveBeenCalledWith("vudl:123", "delete");
        });

        it("handles empty job gracefully", async () => {
            jest.spyOn(indexer, "indexPid").mockResolvedValue(needleResponse);

            await expect(index.run(null)).rejects.toThrow(/No pid provided/);
            expect(unlockPidSpy).not.toHaveBeenCalled();
        });

        it("handles empty data gracefully", async () => {
            job.data = {};
            jest.spyOn(indexer, "indexPid").mockResolvedValue(needleResponse);

            await expect(index.run(job)).rejects.toThrow(/No pid provided/);
            expect(unlockPidSpy).not.toHaveBeenCalled();
        });

        it("handles missing pid gracefully", async () => {
            job.data = { action: "index" };
            jest.spyOn(indexer, "indexPid").mockResolvedValue(needleResponse);

            await expect(index.run(job)).rejects.toThrow(/No pid provided/);
            expect(unlockPidSpy).not.toHaveBeenCalled();
        });

        it("handles missing action gracefully", async () => {
            delete job.data.action;
            jest.spyOn(indexer, "indexPid").mockResolvedValue(needleResponse);

            await expect(index.run(job)).rejects.toThrow(/Unexpected index action: undefined/);
            expect(unlockPidSpy).not.toHaveBeenCalled();
        });

        it("indexes the pid", async () => {
            job.data.action = "index";
            jest.spyOn(indexer, "indexPid").mockResolvedValue(needleResponse);

            await index.run(job);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledWith("Indexing...", { action: "index", pid: "vudl:123" });
            expect(indexer.indexPid).toHaveBeenCalledWith(job.data.pid);
            expect(unlockPidSpy).toHaveBeenCalledWith("vudl:123", "index");
        });

        it("retries indexing the pid if parents are missing unexpectedly", async () => {
            job.data.action = "index";
            jest.spyOn(indexer, "indexPid").mockResolvedValue(needleResponse);
            indexer.getLastIndexResults.mockReturnValueOnce({ fedora_parent_id_str_mv: [] });

            await index.run(job);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
            expect(consoleErrorSpy).toHaveBeenNthCalledWith(
                1,
                new Error("vudl:123 has no parents and is not a configured top-level pid"),
            );
            expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, "Retrying...");
            expect(sleepSpy).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledWith("Indexing...", { action: "index", pid: "vudl:123" });
            expect(indexer.indexPid).toHaveBeenCalledWith(job.data.pid);
            expect(unlockPidSpy).toHaveBeenCalledWith("vudl:123", "index");
        });

        it("throws an error when action does not exist", async () => {
            job.data.action = "fake action";

            await expect(index.run(job)).rejects.toThrow(/Unexpected index/);
            expect(unlockPidSpy).not.toHaveBeenCalled();
        });

        it("retries, sleeps and times out when there is a pid conflict", async () => {
            const badJob = JSON.parse(JSON.stringify(job));
            job.id = "2";
            queueSpy.mockResolvedValue([badJob, job]);
            await expect(index.run(job)).rejects.toThrow(/Exceeded retries waiting for queue to clear/);
            expect(sleepSpy).toHaveBeenCalledTimes(60);
            expect(sleepSpy).toHaveBeenCalledWith(1000);
        });

        it("throws an error for statusCode not 200", async () => {
            Config.setInstance(new Config({ indexer: { exceptionRetries: "3", exceptionWaitMs: "100" } }));
            needleResponse.statusCode = 404;
            jest.spyOn(indexer, "deletePid").mockResolvedValue(needleResponse);
            await expect(index.run(job)).rejects.toThrow(/Problem performing/);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(5);
            const expectedError = new Error("Problem performing delete on vudl:123: unspecified error");
            expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, expectedError);
            expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, "Retrying...");
            expect(consoleErrorSpy).toHaveBeenNthCalledWith(3, expectedError);
            expect(consoleErrorSpy).toHaveBeenNthCalledWith(4, "Retrying...");
            expect(consoleErrorSpy).toHaveBeenNthCalledWith(5, expectedError);
            expect(unlockPidSpy).toHaveBeenCalledWith("vudl:123", "delete");
            expect(sleepSpy).toHaveBeenCalledTimes(2);
            expect(sleepSpy).toHaveBeenCalledWith(100);
        });
    });
});
