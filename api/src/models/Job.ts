import { openSync, closeSync, existsSync as fileExists } from "fs";
import path = require("path");

// TODO: reintroduce config when needed: import Config from "./Config";
import JobMetadata from "./JobMetadata";
import ImageFile from "./ImageFile";
import { Queue } from "bullmq";

class Job {
    dir: string;
    name: string;
    _metadata: JobMetadata = null;

    constructor(dir: string) {
        this.dir = dir;
        this.name = path.basename(dir);
    }

    ingest(): void {
        // TODO
        // const metadata = new JobMetadata(this);
        // const lockfile = metadata.ingestLockfile();
    }

    raw(): string {
        return this.name;
    }

    getImage(fileName: string): ImageFile {
        return new ImageFile(this.dir + "/" + fileName);
    }

    makeDerivatives(): void {
        const status = this.metadata.derivativeStatus;
        const lockfile = this.metadata.derivativeLockfile;

        if (status.expected > status.processed && !fileExists(lockfile)) {
            closeSync(openSync(lockfile, "w")); // touch
            const q = new Queue("vudl");
            q.add("derivatives", { dir: this.dir });
        }
    }

    generatePdf(): void {
        // TODO
    }

    get metadata(): JobMetadata {
        if (this._metadata === null) {
            this._metadata = new JobMetadata(this);
        }
        return this._metadata;
    }
}

export default Job;
