import { openSync, closeSync, existsSync as fileExists } from "fs";

import Config from "./Config";
import JobMetadata from "./JobMetadata";
import ImageFile from "./ImageFile";
import { Queue } from "bullmq";

class Job {
    dir: string;
    name: string;
    _metadata: JobMetadata = null;

    constructor(dir: string) {
        this.dir = dir;
        this.name = this.basename(dir);
    }

    ingest(): void {
        // const metadata = new JobMetadata(this);
        // const lockfile = metadata.ingestLockfile(this);
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config(): any {
        // any from "ini" library
        const config = Config.getInstance();
        console.log(config.message); // Prints out: 'I am an instance'
        config.message = "Foo Bar"; // Overwrite message property
        const instance = config.getInstance();
        console.log(instance.message); // Prints out: 'Foo Bar'
        return instance;
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

    basename(path: string): string {
        return path.replace(/\/$/, "").split("/").reverse()[0];
    }
}

export default Job;
