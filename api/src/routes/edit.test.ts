import * as request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "../app";
import edit from "./edit";
import Config from "../models/Config";
import DatastreamManager from "../services/DatastreamManager";
import FedoraObjectFactory from "../services/FedoraObjectFactory";
import HierarchyCollector from "../services/HierarchyCollector";
import * as Database from "../services/Database";
import FedoraData from "../models/FedoraData";
import { FedoraObject } from "../models/FedoraObject";

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

    describe("post /object/new", () => {
        beforeEach(() => {
            jest.spyOn(Database, "confirmToken").mockResolvedValue(true);
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        it("requires a model parameter", async () => {
            const response = await request(app)
                .post("/edit/object/new")
                .set("Authorization", "Bearer test")
                .expect(StatusCodes.BAD_REQUEST);
            expect(response.text).toEqual("Missing model parameter.");
        });
        it("requires a title parameter", async () => {
            const response = await request(app)
                .post("/edit/object/new")
                .send({ model: "vudl-system:foo" })
                .set("Authorization", "Bearer test")
                .expect(StatusCodes.BAD_REQUEST);
            expect(response.text).toEqual("Missing title parameter.");
        });
        it("requires a state parameter", async () => {
            const response = await request(app)
                .post("/edit/object/new")
                .send({ model: "vudl-system:foo", title: "bar" })
                .set("Authorization", "Bearer test")
                .expect(StatusCodes.BAD_REQUEST);
            expect(response.text).toEqual("Missing state parameter.");
        });
        it("will fail if parent does not have collection model", async () => {
            const mockData = new FedoraData("pid:123", {}, {}, [], {});
            const collector = HierarchyCollector.getInstance();
            const dataSpy = jest.spyOn(collector, "getFedoraData").mockResolvedValue(mockData);
            const response = await request(app)
                .post("/edit/object/new")
                .send({ model: "vudl-system:foo", title: "bar", state: "Active", parent: "pid:123" })
                .set("Authorization", "Bearer test")
                .expect(StatusCodes.BAD_REQUEST);
            expect(response.text).toEqual("Illegal parent pid:123; not a collection!");
            expect(dataSpy).toHaveBeenCalledTimes(1);
            expect(dataSpy).toHaveBeenCalledWith("pid:123");
        });
        it("will succeed if parent has collection model", async () => {
            const mockData = new FedoraData("pid:123", {}, {}, [], {});
            mockData.fedoraDetails = {
                hasModel: [
                    "http://localhost:8080/rest/vudl-system:FolderModel",
                    "http://localhost:8080/rest/vudl-system:CoreModel",
                    "http://localhost:8080/rest/vudl-system:CollectionModel",
                ],
            };
            const collector = HierarchyCollector.getInstance();
            const dataSpy = jest.spyOn(collector, "getFedoraData").mockResolvedValue(mockData);
            const factory = FedoraObjectFactory.getInstance();
            const newObject = FedoraObject.build("child:123");
            const factorySpy = jest.spyOn(factory, "build").mockResolvedValue(newObject);
            const response = await request(app)
                .post("/edit/object/new")
                .send({ model: "vudl-system:foo", title: "bar", state: "Active", parent: "pid:123" })
                .set("Authorization", "Bearer test")
                .expect(StatusCodes.OK);
            expect(response.text).toEqual("child:123");
            expect(dataSpy).toHaveBeenCalledTimes(1);
            expect(dataSpy).toHaveBeenCalledWith("pid:123");
            expect(factorySpy).toHaveBeenCalledTimes(1);
            expect(factorySpy).toHaveBeenCalledWith("foo", "bar", "Active", "pid:123");
        });
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