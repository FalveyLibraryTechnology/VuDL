import PrivateConfig from "./PrivateConfig";
import fs = require("fs");
import ini = require("ini");

class Config {
    private static instance: PrivateConfig;

    constructor() {
        throw new Error("Use Singleton.getInstance()");
    }

    public static getInstance(): PrivateConfig {
        if (!Config.instance) {
            const config = ini.parse(fs.readFileSync(__dirname.replace(/\\/g, "/") + "/../../vudl.ini", "utf-8"));
            // ini returns any, but we can cast it to what we need:
            Config.instance = new PrivateConfig(config as Record<string, string>);
        }
        return Config.instance;
    }
}

export default Config;
