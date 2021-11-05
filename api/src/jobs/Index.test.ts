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
                    pid: 123,
                },
            } as Job;
            jest.spyOn(SolrIndexer, "getInstance").mockReturnValue(indexer);
        });

        it("deletes the pid", async () => {
            jest.spyOn(indexer, "deletePid").mockResolvedValue(needleResponse);

            await index.run(job);

            expect(indexer.deletePid).toHaveBeenCalledWith(job.data.pid);
        });

        it("indexes the pid", async () => {
            job.data.action = "index";
            jest.spyOn(indexer, "indexPid").mockResolvedValue(needleResponse);

            await index.run(job);

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
        });
    });
});
