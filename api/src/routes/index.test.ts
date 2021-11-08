import * as request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "../app";
import index from "./index";
import Config from "../models/Config";

jest.mock("../models/Config");

describe("index", () => {
    let config;
    beforeAll(() => {
        app.use("/", index);
        config = {
            allowedOrigins: ["http://localhost:3000", "http://localhost:9000"],
        };
        jest.spyOn(Config, "getInstance").mockReturnValue(config);
    });

    it("can get the favicon index ", async () => {
        await request(app).get("/favicon.ico").expect(StatusCodes.NOT_FOUND);
    });
});
