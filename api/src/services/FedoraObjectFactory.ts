import Config from "../models/Config";
import { FedoraObject } from "../models/FedoraObject";
import { getNextPid } from "./Database";
import winston = require("winston");

class FedoraObjectFactory {
    private static instance: FedoraObjectFactory = null;

    protected config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    static getInstance(): FedoraObjectFactory {
        if (this.instance === null) {
            this.instance = new FedoraObjectFactory(Config.getInstance());
        }
        return this.instance;
    }

    log(logger: winston.Logger = null, msg = ""): void {
        if (logger !== null) {
            logger.info(msg);
        }
    }

    async build(
        model: string,
        title: string,
        state = "Inactive",
        parentPid: string = null,
        logger: winston.Logger = null
    ): Promise<FedoraObject> {
        const pid = await getNextPid(this.config.pidNamespace);
        const object = await FedoraObject.build(pid, logger, this.config);
        object.title = title;
        object.parentPid = parentPid;
        await object.initialize(state, model);
        return object;
    }
}

export default FedoraObjectFactory;
