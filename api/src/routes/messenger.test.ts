import * as request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "../app";
import messenger from "./messenger";
import Config from "../models/Config";
import QueueManager from "../services/QueueManager";

jest.mock("../models/Config");
jest.mock("../services/QueueManager");

describe("messenger", () => {
    let config;
    let body;
    let pid;
    beforeAll(() => {
        app.use("/messenger", messenger);
        config = {
            restBaseUrl: "www.test.com",
            allowedOrigins: ["http://localhost:3000", "http://localhost:9000"],
        };
        pid = "vudl:123";
        body = {
            id: `www.test.com/${pid}/MASTER`,
            type: "#Create",
        };

        jest.spyOn(Config, "getInstance").mockReturnValue(config);
    });

    describe("/camel", () => {
        let queueManager;
        beforeEach(() => {
            queueManager = {
                performIndexOperation: jest.fn(),
                queueMetadataOperation: jest.fn(),
            };
            jest.spyOn(QueueManager, "getInstance").mockReturnValue(queueManager);
        });

        it("will queue a metadata operation", async () => {
            await request(app).post("/messenger/camel").send(body).expect(StatusCodes.OK);

            expect(queueManager.queueMetadataOperation).toHaveBeenCalledWith(pid, "add");
        });
    });
});
