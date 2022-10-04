import Config from "./Config";

describe("Config", () => {
    it("should return reasonable defaults", () => {
        const config = new Config({});
        expect(config.favoritePids).toEqual([]);
        expect(config.dublinCoreFields).toEqual({});
    });

    it("should return Dublin Core settings from configuration", () => {
        const dublin_core = { foo: "bar" };
        const config = new Config({ dublin_core });
        expect(config.dublinCoreFields).toEqual(dublin_core);
    });

    it("should return favorite PIDs from configuration", () => {
        const favorite_pids = ["pid1", "pid2"];
        const config = new Config({ favorite_pids });
        expect(config.favoritePids).toEqual(favorite_pids);
    });
});
