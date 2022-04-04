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
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("can get the favicon index ", async () => {
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
        await request(app).get("/favicon.ico").expect(StatusCodes.NOT_FOUND);
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        // Second parameter is timestamp; we don't really care what it is:
        expect(consoleLogSpy).toHaveBeenCalledWith("Time: ", expect.anything());
    });
});
