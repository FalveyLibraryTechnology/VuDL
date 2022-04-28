import * as request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "../app";
import { authRouter } from "./auth";
import Config from "../models/Config";

describe("index", () => {
    beforeAll(() => {
        app.use("/auth", authRouter);
    });
    beforeEach(() => {
        Config.setInstance(new Config({}));
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("displays a login form by default", async () => {
        const response = await request(app).get("/auth/login").expect(StatusCodes.OK);
        expect(response.text).toContain(`<form action="/api/auth/login" method="post">`);
        expect(response.text).toContain("Username");
        expect(response.text).toContain("Password");
        expect(response.text).toContain("Submit");
    });
});
