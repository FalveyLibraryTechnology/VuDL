import * as request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "../app";
import messenger from "./messenger";
import Config from "../models/Config";
import QueueManager from "../services/QueueManager";

jest.mock("../services/QueueManager");

describe("messenger", () => {
    let config;
    beforeAll(() => {
        app.use("/messenger", messenger);
        config = {
            allowed_origins: ["http://localhost:3000", "http://localhost:9000"],
        };
        Config.setInstance(new Config(config));
    });

    describe("/camel", () => {
        let body;
        let pid;
        let queueManager;
        beforeEach(() => {
            pid = "vudl:123";
            body = {
                id: `www.test.com/${pid}/MASTER`,
                type: "#Create",
            };
            queueManager = {
                performIndexOperation: jest.fn(),
                queueMetadataOperation: jest.fn(),
            };
            jest.spyOn(QueueManager, "getInstance").mockReturnValue(queueManager);
        });

        it("will handle missing IDs appropriately", async () => {
            body = {};
            const response = await request(app).post("/messenger/camel").send(body).expect(StatusCodes.BAD_REQUEST);
            expect(response.text).toEqual("Missing id in body");
        });

        it("will handle missing types appropriately", async () => {
            delete body.type;
            const response = await request(app).post("/messenger/camel").send(body).expect(StatusCodes.BAD_REQUEST);
            expect(response.text).toEqual("Missing type in body");
        });

        it("will handle missing PIDs appropriately", async () => {
            body.id = `www.test.com/`;
            const response = await request(app).post("/messenger/camel").send(body).expect(StatusCodes.OK);
            expect(response.text).toEqual("ok - nothing to process");
        });

        it("handles unknown messages appropriately", async () => {
            body.type = "#Weird";
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
            const response = await request(app).post("/messenger/camel").send(body).expect(StatusCodes.BAD_REQUEST);
            const expectedMessage = "Unexpected action: Weird (on PID: vudl:123)";
            expect(consoleErrorSpy).toHaveBeenCalledWith(expectedMessage);
            expect(response.text).toEqual(expectedMessage);
        });

        it("will only queue an index operation for base PID", async () => {
            body.id = `www.test.com/${pid}`;
            await request(app).post("/messenger/camel").send(body).expect(StatusCodes.OK);

            expect(queueManager.performIndexOperation).toHaveBeenCalledWith(pid, "index");
            expect(queueManager.queueMetadataOperation).not.toHaveBeenCalled();
        });

        it("will only queue an index operation for non-MASTER datastreams", async () => {
            body.id = `www.test.com/${pid}/THUMBNAIL`;
            await request(app).post("/messenger/camel").send(body).expect(StatusCodes.OK);

            expect(queueManager.performIndexOperation).toHaveBeenCalledWith(pid, "index");
            expect(queueManager.queueMetadataOperation).not.toHaveBeenCalled();
        });

        it("will queue index AND metadata operation for MASTER datastreams", async () => {
            await request(app).post("/messenger/camel").send(body).expect(StatusCodes.OK);

            expect(queueManager.performIndexOperation).toHaveBeenCalledWith(pid, "index");
            expect(queueManager.queueMetadataOperation).toHaveBeenCalledWith(pid, "add");
        });

        it("will handle deletion of the base PID", async () => {
            body.id = `www.test.com/${pid}`;
            body.type = "#Delete";
            await request(app).post("/messenger/camel").send(body).expect(StatusCodes.OK);

            expect(queueManager.performIndexOperation).toHaveBeenCalledWith(pid, "delete");
            expect(queueManager.queueMetadataOperation).not.toHaveBeenCalled();
        });

        it("will ignore Follow actions", async () => {
            body.id = `www.test.com/${pid}`;
            body.type = "#Follow";
            await request(app).post("/messenger/camel").send(body).expect(StatusCodes.OK);

            expect(queueManager.performIndexOperation).not.toHaveBeenCalled();
            expect(queueManager.queueMetadataOperation).not.toHaveBeenCalled();
        });

        it("will handle purging of the base PID (same as Deletion)", async () => {
            body.id = `www.test.com/${pid}`;
            body.type = "#Purge";
            await request(app).post("/messenger/camel").send(body).expect(StatusCodes.OK);

            expect(queueManager.performIndexOperation).toHaveBeenCalledWith(pid, "delete");
            expect(queueManager.queueMetadataOperation).not.toHaveBeenCalled();
        });

        it("will treat datastream deletion as an update", async () => {
            body.id = `www.test.com/${pid}/THUMBNAIL`;
            body.type = "#Delete";
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
            await request(app).post("/messenger/camel").send(body).expect(StatusCodes.OK);

            expect(queueManager.performIndexOperation).toHaveBeenCalledWith(pid, "index");
            expect(queueManager.queueMetadataOperation).not.toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith("vudl:123 datastream THUMBNAIL deleted; updating...");
        });
    });
});
