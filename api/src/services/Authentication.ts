import crypto = require("crypto");
import Config from "../models/Config";

class Authentication {
    private static instance: Authentication;
    config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    public static getInstance(): Authentication {
        if (!Authentication.instance) {
            Authentication.instance = new Authentication(Config.getInstance());
        }
        return Authentication.instance;
    }

    public hashPassword(password: string): string {
        const hash = crypto.createHash(this.config.authenticationHashAlgorithm);
        // TODO: add salt
        hash.update(password);
        return hash.digest("hex");
    }
}

export default Authentication;
