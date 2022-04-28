import Authentication from "./Authentication";
import Config from "../models/Config";
import crypto = require("crypto");

describe("Authentication", () => {
    beforeEach(() => {
        Config.setInstance(
            new Config({
                Authentication: {
                    salt: "my-salt-value",
                },
            })
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("hashes passwords correctly", () => {
        const fakeHash = { update: jest.fn(), digest: jest.fn() } as unknown as crypto.Hash;
        const createSpy = jest.spyOn(crypto, "createHash").mockReturnValue(fakeHash);

        const auth = Authentication.getInstance();
        const updateSpy = jest.spyOn(fakeHash, "update");
        const digestSpy = jest.spyOn(fakeHash, "digest").mockReturnValue("fakeHash");
        const hash = auth.hashPassword("fakepassword");

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledWith("sha1");
        expect(hash).toEqual("fakeHash");
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).toHaveBeenCalledWith("fakepasswordmy-salt-value");
        expect(digestSpy).toHaveBeenCalledTimes(1);
    });
});
