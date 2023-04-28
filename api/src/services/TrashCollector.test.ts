import Config from "../models/Config";
import Fedora from "./Fedora";
import FedoraDataCollector from "./FedoraDataCollector";
import TrashCollector from "./TrashCollector";

describe("TrashCollector", () => {
    let collector;
    beforeEach(() => {
        Config.setInstance(new Config({}));
        collector = TrashCollector.getInstance();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("pidIsSafeToPurge", () => {
        let getDataSpy;
        beforeEach(() => {
            getDataSpy = jest.spyOn(FedoraDataCollector.getInstance(), "getObjectData");
        });
        it("won't allow purging of active pids", async () => {
            getDataSpy.mockResolvedValue({ fedoraDetails: { state: ["Active"] } });
            expect(await collector.pidIsSafeToPurge("foo")).toEqual(false);
            expect(getDataSpy).toHaveBeenCalledTimes(1);
            expect(getDataSpy).toHaveBeenCalledWith("foo");
        });

        it("will allow purging of partially deleted pids", async () => {
            getDataSpy.mockImplementation(() => {
                throw new Error("Unexpected status code: 410");
            });
            expect(await collector.pidIsSafeToPurge("foo")).toEqual(true);
            expect(getDataSpy).toHaveBeenCalledTimes(1);
            expect(getDataSpy).toHaveBeenCalledWith("foo");
        });

        it("will rethrow unexpected exceptions", async () => {
            const error = new Error("Kerboom");
            getDataSpy.mockImplementation(() => {
                throw error;
            });
            let thrownError = null;
            try {
                await collector.pidIsSafeToPurge("foo");
            } catch (e) {
                thrownError = e;
            }
            expect(thrownError).toEqual(error);
        });

        it("will allow purging of deleted pids", async () => {
            getDataSpy.mockResolvedValue({ fedoraDetails: { state: ["Deleted"] } });
            expect(await collector.pidIsSafeToPurge("foo")).toEqual(true);
            expect(getDataSpy).toHaveBeenCalledTimes(1);
            expect(getDataSpy).toHaveBeenCalledWith("foo");
        });
    });

    describe("purgePid", () => {
        let deleteSpy;
        let deleteTombstoneSpy;
        let safeSpy;
        beforeEach(() => {
            const fedora = Fedora.getInstance();
            deleteSpy = jest.spyOn(fedora, "deleteObject").mockImplementation(jest.fn());
            deleteTombstoneSpy = jest.spyOn(fedora, "deleteObjectTombstone").mockImplementation(jest.fn());
            safeSpy = jest.spyOn(collector, "pidIsSafeToPurge");
        });

        it("returns false if PID is ineligible for purging", async () => {
            safeSpy.mockResolvedValue(false);
            expect(await collector.purgePid("foo")).toEqual(false);
            expect(safeSpy).toHaveBeenCalledTimes(1);
            expect(safeSpy).toHaveBeenCalledWith("foo");
            expect(deleteSpy).not.toHaveBeenCalled();
            expect(deleteTombstoneSpy).not.toHaveBeenCalled();
        });

        it("purges the object when eligible", async () => {
            safeSpy.mockResolvedValue(true);
            expect(await collector.purgePid("foo")).toEqual(true);
            expect(safeSpy).toHaveBeenCalledTimes(1);
            expect(safeSpy).toHaveBeenCalledWith("foo");
            expect(deleteSpy).toHaveBeenCalledTimes(1);
            expect(deleteSpy).toHaveBeenCalledWith("foo");
            expect(deleteTombstoneSpy).toHaveBeenCalledTimes(1);
            expect(deleteTombstoneSpy).toHaveBeenCalledWith("foo");
        });
    });

    describe("purgePids", () => {
        it("returns a list of failed/skipped PIDs", async () => {
            // Mock implementation will return false for pid 1, throw exception for pid 2 and succeed for all else,
            // in order to test all relevant code paths.
            const fakeError = new Error("Kerblooie!");
            const purgeSpy = jest.spyOn(collector, "purgePid").mockImplementation((pid) => {
                if (pid === "pid:2") {
                    throw fakeError;
                }
                return pid !== "pid:1";
            });
            const errorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
            const skippedList = await collector.purgePids(["pid:1", "pid:2", "pid:3"]);
            expect(skippedList).toEqual(["pid:1", "pid:2"]);
            expect(purgeSpy).toHaveBeenCalledTimes(3);
            expect(errorSpy).toHaveBeenCalledTimes(1);
            expect(errorSpy).toHaveBeenCalledWith(fakeError);
        });
    });
});
