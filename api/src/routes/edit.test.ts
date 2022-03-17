import * as request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "../app";
import edit from "./edit";
import Config from "../models/Config";
import DatastreamManager from "../services/DatastreamManager";
import * as Database from "../services/Database";

jest.mock("../models/Config");
jest.mock("../services/Database");
jest.mock("../services/DatastreamManager");

describe("edit", () => {
    let config;
    let pid;
    let datastream;
    beforeAll(() => {
        app.use("/edit", edit);
        config = {
            restBaseUrl: "www.test.com",
            allowedOrigins: ["http://localhost:3000", "http://localhost:9000"],
        };
        pid = "vudl:123";
        datastream = "test1";
        jest.spyOn(Config, "getInstance").mockReturnValue(config);
    });

    describe("delete /object/:pid/datastream/:stream", () => {
        let datastreamManager;
        beforeEach(() => {
            datastreamManager = {
                deleteDatastream: jest.fn(),
            };
            jest.spyOn(Database, "confirmToken").mockResolvedValue(true);
            jest.spyOn(DatastreamManager, "getInstance").mockReturnValue(datastreamManager);
        });

        it("will delete a datastream", async () => {
            datastreamManager.deleteDatastream.mockResolvedValue({});

            await request(app)
                .delete(`/edit/object/${pid}/datastream/${datastream}`)
                .set("Authorization", "Bearer test")
                .expect(StatusCodes.OK);

            expect(datastreamManager.deleteDatastream).toHaveBeenCalledWith(pid, datastream);
        });
    });
});
