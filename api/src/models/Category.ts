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
            return new Job(dir);
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get ini(): any {
        const iniFile = this.dir + "/batch-params.ini";
        const rawIni = fs.existsSync(iniFile) ? fs.readFileSync(iniFile, "utf-8") : "";
        return ini.parse(rawIni);
    }

    get supportsOcr(): boolean {
        return this.ini["ocr"]["ocr"] && this.ini["ocr"]["ocr"].tr(" '\"", "") != "false";
    }

    get supportsPdfGeneration(): boolean {
        return this.ini["pdf"]["generate"] && this.ini["pdf"]["generate"].tr(" '\"", "") != "false";
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
