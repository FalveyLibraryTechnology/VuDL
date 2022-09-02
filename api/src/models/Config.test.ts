import Config from "./Config";

describe("Config", () => {
    it("should return reasonable defaults", () => {
        const config = new Config({});
        expect(config.favoritePids).toEqual([]);
    });

    it("should return favorite PIDs from configuration", () => {
        const favorite_pids = ["pid1", "pid2"];
        const config = new Config({ favorite_pids });
        expect(config.favoritePids).toEqual(favorite_pids);
    });
});
