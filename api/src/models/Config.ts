import PrivateConfig from "./PrivateConfig";

class Config {
    private static instance: PrivateConfig;

    constructor() {
        throw new Error("Use Singleton.getInstance()");
    }

    public static getInstance(): PrivateConfig {
        if (!Config.instance) {
            Config.instance = new PrivateConfig();
        }
        return Config.instance;
    }
}

export default Config;
