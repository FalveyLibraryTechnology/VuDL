import Config from "../models/Config";
import { execSync } from "child_process";
import fs = require("fs");
import tmp = require("tmp");

class TikaExtractor {
    protected filename: string;
    protected config: Config;

    constructor(data: Buffer, config: Config) {
        this.config = config;
        // Write the data to a temporary file:
        const tmpobj = tmp.fileSync();
        this.filename = tmpobj.name;
        fs.writeSync(tmpobj.fd, data);
    }

    extractText(): string {
        const javaPath = this.config.javaPath;
        const tikaPath = this.config.tikaPath;
        const tikaCommand = javaPath + " -jar " + tikaPath + " --text -eUTF8 " + this.filename;
        const result = execSync(tikaCommand).toString();
        fs.rmSync(this.filename); // clean up temp file; we're done now!
        return result;
    }
}

export default TikaExtractor;
