import * as request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "../app";
import edit from "./edit";
import Config from "../models/Config";
import DatastreamManager from "../services/DatastreamManager";
import Fedora from "../services/Fedora";
import FedoraObjectFactory from "../services/FedoraObjectFactory";
import FedoraDataCollector from "../services/FedoraDataCollector";
import Database from "../services/Database";
import FedoraDataCollection from "../models/FedoraDataCollection";
import { FedoraObject } from "../models/FedoraObject";

jest.mock("../services/DatastreamManager");

describe("edit", () => {
    let config;
    let pid;
    let datastream;
    beforeAll(() => {
        app.use("/edit", edit);
        config = {
            base_url: "www.test.com",
            allowed_origins: ["http://localhost:3000", "http://localhost:9000"],
        };
        Config.setInstance(new Config(config));
        pid = "foo:123";
        datastream = "test1";
    });

    describe("post /object/new", () => {
        beforeEach(() => {
            jest.spyOn(Database.getInstance(), "confirmToken").mockResolvedValue(true);
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
            const mockData = FedoraDataCollection.build("pid:123");
            const collector = FedoraDataCollector.getInstance();
            const dataSpy = jest.spyOn(collector, "getObjectData").mockResolvedValue(mockData);
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
            const mockData = FedoraDataCollection.build("pid:123");
            mockData.fedoraDetails = {
                hasModel: [
                    "http://localhost:8080/rest/vudl-system:FolderModel",
                    "http://localhost:8080/rest/vudl-system:CoreModel",
                    "http://localhost:8080/rest/vudl-system:CollectionModel",
                ],
            };
            const collector = FedoraDataCollector.getInstance();
            const dataSpy = jest.spyOn(collector, "getObjectData").mockResolvedValue(mockData);
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

    describe("post /object/:pid/datastream/:stream/license", () => {
        let datastreamManager;
        let licenseKey;
        beforeEach(() => {
            datastreamManager = {
                uploadLicense: jest.fn(),
            };
            licenseKey = "testLicenseKey";
            jest.spyOn(Database.getInstance(), "confirmToken").mockResolvedValue(true);
            jest.spyOn(DatastreamManager, "getInstance").mockReturnValue(datastreamManager);
        });

        it("uploads a license", async () => {
            datastreamManager.uploadLicense.mockResolvedValue({});

            await request(app)
                .post(`/edit/object/${pid}/datastream/${datastream}/license`)
                .set("Authorization", "Bearer test")
                .send({ licenseKey })
                .set("Accept", "application/json")
                .expect(StatusCodes.OK);

            expect(datastreamManager.uploadLicense).toHaveBeenCalledWith(pid, datastream, licenseKey);
        });
    });

    describe("get /object/:pid/datastream/:stream/license", () => {
        let datastreamManager;
        let licenseKey;
        beforeEach(() => {
            datastreamManager = {
                getLicenseKey: jest.fn(),
            };
            licenseKey = "testLicenseKey";
            jest.spyOn(Database.getInstance(), "confirmToken").mockResolvedValue(true);
            jest.spyOn(DatastreamManager, "getInstance").mockReturnValue(datastreamManager);
        });
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("gets the license key", async () => {
            datastreamManager.getLicenseKey.mockResolvedValue(licenseKey);

            const response = await request(app)
                .get(`/edit/object/${pid}/datastream/${datastream}/license`)
                .set("Authorization", "Bearer test")
                .expect(StatusCodes.OK);
            expect(response.text).toEqual(licenseKey);
            expect(datastreamManager.getLicenseKey).toHaveBeenCalledWith(pid, datastream);
        });

        it("sends an error status code", async () => {
            datastreamManager.getLicenseKey.mockRejectedValue("get license key fails");

            await request(app)
                .get(`/edit/object/${pid}/datastream/${datastream}/license`)
                .set("Authorization", "Bearer test")
                .expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });

    describe("delete /object/:pid/datastream/:stream", () => {
        let datastreamManager;
        beforeEach(() => {
            datastreamManager = {
                deleteDatastream: jest.fn(),
            };
            jest.spyOn(Database.getInstance(), "confirmToken").mockResolvedValue(true);
            jest.spyOn(DatastreamManager, "getInstance").mockReturnValue(datastreamManager);
        });
        afterEach(() => {
            jest.clearAllMocks();
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

    describe("get /object/:pid/datastream/:stream/download", () => {
        let datastreamManager;
        let mimeType;
        let buffer;
        beforeEach(() => {
            mimeType = "text/xml";
            buffer = Buffer.from("test2");
            datastreamManager = {
                getMimeType: jest.fn(),
                downloadBuffer: jest.fn(),
            };
            jest.spyOn(Database.getInstance(), "confirmToken").mockResolvedValue(true);
            jest.spyOn(DatastreamManager, "getInstance").mockReturnValue(datastreamManager);
        });
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("will download the datastream content", async () => {
            datastreamManager.getMimeType.mockResolvedValue(mimeType);
            datastreamManager.downloadBuffer.mockResolvedValue(buffer);

            await request(app)
                .get(`/edit/object/${pid}/datastream/${datastream}/download`)
                .set("Authorization", "Bearer test")
                .expect("Content-Disposition", `attachment; filename=foo_123_${datastream}.xml`)
                .expect("Content-Type", mimeType + "; charset=utf-8")
                .expect(StatusCodes.OK);

            expect(datastreamManager.getMimeType).toHaveBeenCalledWith(pid, datastream);
            expect(datastreamManager.downloadBuffer).toHaveBeenCalledWith(pid, datastream);
        });
    });

    describe("get /object/:pid/datastream/:stream/view", () => {
        let datastreamManager;
        let mimeType;
        let buffer;
        beforeEach(() => {
            mimeType = "text/xml";
            buffer = Buffer.from("test2");
            datastreamManager = {
                getMimeType: jest.fn(),
                downloadBuffer: jest.fn(),
            };
            jest.spyOn(Database.getInstance(), "confirmToken").mockResolvedValue(true);
            jest.spyOn(DatastreamManager, "getInstance").mockReturnValue(datastreamManager);
        });
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("will view the datastream content", async () => {
            datastreamManager.getMimeType.mockResolvedValue(mimeType);
            datastreamManager.downloadBuffer.mockResolvedValue(buffer);

            await request(app)
                .get(`/edit/object/${pid}/datastream/${datastream}/view`)
                .set("Authorization", "Bearer test")
                .expect("Content-Disposition", "inline")
                .expect("Content-Type", mimeType + "; charset=utf-8")
                .expect(StatusCodes.OK);

            expect(datastreamManager.getMimeType).toHaveBeenCalledWith(pid, datastream);
            expect(datastreamManager.downloadBuffer).toHaveBeenCalledWith(pid, datastream);
        });
    });

    describe("put /object/:pid/state", () => {
        it("will reject invalid states", async () => {
            const response = await request(app)
                .put(`/edit/object/${pid}/state`)
                .set("Authorization", "Bearer test")
                .set("Content-Type", "text/plain")
                .send("Illegal")
                .expect(StatusCodes.BAD_REQUEST);
            expect(response.error.text).toEqual("Illegal state: Illegal");
        });

        it("will accept a valid state", async () => {
            const fedora = Fedora.getInstance();
            const stateSpy = jest.spyOn(fedora, "modifyObjectState").mockImplementation(jest.fn());

            await request(app)
                .put(`/edit/object/${pid}/state`)
                .set("Authorization", "Bearer test")
                .set("Content-Type", "text/plain")
                .send("Active")
                .expect(StatusCodes.OK);

            expect(stateSpy).toHaveBeenCalledWith(pid, "Active");
        });
    });

    describe("put /object/:pid/positionInParent/:parentPid", () => {
        let parentPid: string;
        let mockData: FedoraDataCollection;
        let sequenceSpy;
        beforeEach(() => {
            parentPid = "foo:100";
            mockData = FedoraDataCollection.build(pid);
            const collector = FedoraDataCollector.getInstance();
            jest.spyOn(collector, "getHierarchy").mockResolvedValue(mockData);
            const fedora = Fedora.getInstance();
            sequenceSpy = jest.spyOn(fedora, "updateSequenceRelationship").mockImplementation(jest.fn());
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        it("will reject an illegal parent/child pair", async () => {
            const response = await request(app)
                .put(`/edit/object/${pid}/positionInParent/${parentPid}`)
                .set("Authorization", "Bearer test")
                .set("Content-Type", "text/plain")
                .send("2")
                .expect(StatusCodes.BAD_REQUEST);
            expect(response.error.text).toEqual("foo:100 is not an immediate parent of foo:123.");
        });

        it("will reject setting a position in an un-ordered parent", async () => {
            mockData.addParent(FedoraDataCollection.build(parentPid));
            const response = await request(app)
                .put(`/edit/object/${pid}/positionInParent/${parentPid}`)
                .set("Authorization", "Bearer test")
                .set("Content-Type", "text/plain")
                .send("2")
                .expect(StatusCodes.BAD_REQUEST);
            expect(response.error.text).toEqual("foo:100 has sort value of title; custom is required.");
        });

        it("updates sequence when appropriate preconditions are met", async () => {
            const parent = FedoraDataCollection.build(parentPid);
            parent.fedoraDetails.sortOn = ["custom"];
            mockData.addParent(parent);
            await request(app)
                .put(`/edit/object/${pid}/positionInParent/${parentPid}`)
                .set("Authorization", "Bearer test")
                .set("Content-Type", "text/plain")
                .send("2")
                .expect(StatusCodes.OK);
            expect(sequenceSpy).toHaveBeenCalledWith(pid, parentPid, 2);
        });
    });
});
