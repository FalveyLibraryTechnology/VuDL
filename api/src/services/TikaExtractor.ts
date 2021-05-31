import Config from "../models/Config";
import { execSync } from "child_process";
import fs = require("fs");
import tmp = require("tmp");

class TikaExtractor {
    protected filename: string;

    constructor(data: Buffer) {
        // Write the data to a temporary file:
        const tmpobj = tmp.fileSync();
        this.filename = tmpobj.name;
        fs.writeSync(tmpobj.fd, data);
    }

    extractText(): string {
        const javaPath = Config.getInstance().javaPath;
        const tikaPath = Config.getInstance().tikaPath;
        const tikaCommand = javaPath + " -jar " + tikaPath + " --text -eUTF8 " + this.filename;
        const result = execSync(tikaCommand).toString().replace(/\s+/g, " ");
        fs.rmSync(this.filename);   // clean up temp file; we're done now!
        return result;
    }
}

export default TikaExtractor;
