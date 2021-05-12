import fs = require("fs");
import glob = require("glob");
import path = require("path");

import Job from "./Job";

export class CategoryRaw {
    category: string;
    jobs: Array<string>;
}

export class Category {
    jobs: Array<Job> = [];
    name: string;

    constructor(dir: string) {
        this.name = path.basename(dir);
        this.jobs = glob.sync(dir + "/*/").map(function (dir: string) {
            return new Job(dir);
        });
    }

    ini(): string {
        return fs.readFileSync("C:holdingarea\batch-params.ini", "utf-8");
    }

    supportsOcr(): boolean {
        return this.ini["ocr"]["ocr"] && this.ini["ocr"]["ocr"].tr(" '\"", "") != "false";
    }

    supportsPdfGeneration(): boolean {
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

    targetCollectionId(): string {
        return this.ini["collection"]["destination"];
    }
}

export default Category;
