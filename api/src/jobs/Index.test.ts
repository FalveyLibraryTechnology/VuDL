import Index from "./Index";
import { Job } from "bullmq";
import { NeedleResponse } from "../services/interfaces";
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
        beforeEach(() => {
            needleResponse = {
                statusCode: 200,
            } as NeedleResponse;
            indexer = {
                deletePid: jest.fn(),
                indexPid: jest.fn(),
            };
            job = {
                data: {
                    action: "delete",
                    pid: "vudl:123",
                },
            } as Job;
            jest.spyOn(SolrIndexer, "getInstance").mockReturnValue(indexer);
            consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
            consoleLogSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
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
        });

        it("handles empty job gracefully", async () => {
            jest.spyOn(indexer, "indexPid").mockResolvedValue(needleResponse);

            await expect(index.run(null)).rejects.toThrow(/No pid provided/);
        });

        it("handles empty data gracefully", async () => {
            job.data = {};
            jest.spyOn(indexer, "indexPid").mockResolvedValue(needleResponse);

            await expect(index.run(job)).rejects.toThrow(/No pid provided/);
        });

        it("handles missing pid gracefully", async () => {
            job.data = { action: "index" };
            jest.spyOn(indexer, "indexPid").mockResolvedValue(needleResponse);

            await expect(index.run(job)).rejects.toThrow(/No pid provided/);
        });

        it("handles missing action gracefully", async () => {
            delete job.data.action;
            jest.spyOn(indexer, "indexPid").mockResolvedValue(needleResponse);

            await expect(index.run(job)).rejects.toThrow(/Unexpected index action: undefined/);
        });

        it("indexes the pid", async () => {
            job.data.action = "index";
            jest.spyOn(indexer, "indexPid").mockResolvedValue(needleResponse);

            await index.run(job);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledWith("Indexing...", { action: "index", pid: "vudl:123" });
            expect(indexer.indexPid).toHaveBeenCalledWith(job.data.pid);
        });

        it("throws an error when action does not exist", async () => {
            job.data.action = "fake action";

            await expect(index.run(job)).rejects.toThrow(/Unexpected index/);
        });

        it("throws an error for statusCode not 200", async () => {
            needleResponse.statusCode = 404;
            jest.spyOn(indexer, "deletePid").mockResolvedValue(needleResponse);
            await expect(index.run(job)).rejects.toThrow(/Problem performing/);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Problem performing delete on vudl:123: unspecified error");
        });
    });
});
