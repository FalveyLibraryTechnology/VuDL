import fs = require("fs");
import glob = require("glob");
import ini = require("ini"); // returns <any>
import path = require("path");

import Job from "./Job";

export class CategoryRaw {
    category: string;
    jobs: Array<string>;
}

export class Category {
    jobs: Array<Job> = [];
    name: string;
    dir: string;

    constructor(dir: string) {
        this.dir = dir;
        this.name = path.basename(dir);
        this.jobs = glob.sync(dir + "/*/").map(function (dir: string) {
            return Job.build(dir);
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get ini(): any {
        const iniFile = this.dir + "/batch-params.ini";
        const rawIni = fs.existsSync(iniFile) ? fs.readFileSync(iniFile, "utf-8") : "";
        return ini.parse(rawIni);
    }

    get supportsOcr(): boolean {
        const setting = (this.ini.ocr ?? {}).ocr ?? false;
        return typeof setting === "boolean" ? setting : setting === "true";
    }

    get supportsPdfGeneration(): boolean {
        const setting = (this.ini.pdf ?? {}).generate ?? false;
        return typeof setting === "boolean" ? setting : setting === "true";
    }

    raw(): CategoryRaw {
        return {
            category: this.name,
            jobs: this.jobs.map(function (job: Job) {
                return job.raw();
            }),
        };
    }

    get targetCollectionId(): string {
        return this.ini["collection"]["destination"];
    }
}

export default Category;
