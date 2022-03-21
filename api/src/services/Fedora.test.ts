import Config from "../models/Config";
import Fedora from "./Fedora";

jest.mock("../models/Config");

describe("Fedora", () => {
    let fedora;
    let pid;
    let datastream;
    let config;
    let requestSpy;
    beforeEach(() => {
        config = {
            restBaseUrl: "/test1",
            username: "test2",
            password: "test3",
        };
        pid = "test4";
        datastream = "test5";
        jest.spyOn(Config, "getInstance").mockReturnValue(config);
        fedora = Fedora.getInstance();
    });

    describe("deleteDatastream", () => {
        beforeEach(() => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({});
        });

        it("will delete a datastream", async () => {
            fedora.deleteDatastream(pid, datastream, {});
            expect(requestSpy).toHaveBeenCalledWith("delete", pid + "/" + datastream, null, {});
        });
    });

    describe("deleteDatastreamTombstone", () => {
        beforeEach(() => {
            requestSpy = jest.spyOn(fedora, "_request").mockResolvedValue({});
        });

        it("will delete a datastream tombstone", async () => {
            fedora.deleteDatastreamTombstone(pid, datastream, {});
            expect(requestSpy).toHaveBeenCalledWith("delete", pid + "/" + datastream + "/fcr:tombstone", null, {});
        });
    });
});
