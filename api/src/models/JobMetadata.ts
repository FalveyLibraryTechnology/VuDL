import fs = require("fs");

import { PageRaw } from "./Page";
import PageOrder from "./PageOrder";
import DocumentOrder from "./DocumentOrder";
import Job from "./Job";

interface JobMetadataRaw {
    order: Array<PageRaw>;
    published: boolean;
}

class JobMetadata {
    job: Job;
    _order: PageOrder = null;
    _documents: DocumentOrder = null;
    published = false;

    constructor(job: Job) {
        this.job = job;
        const filename = job.dir + "/job.json";
        if (fs.existsSync(filename)) {
            const json = fs.readFileSync(filename);
            this.raw = JSON.parse(json);
        }
    }

    dc(job: Job): Buffer {
        this.job = job;
        const filename = job.dir + "/dc.xml";
        if (fs.existsSync(filename)) {
            return fs.readFileSync(filename);
        }
    }

    get derivativeLockfile(): string {
        return this.job.dir + "/derivatives.lock";
    }

    get derivativeStatus(): Record<string, number | boolean> {
        // TODO: populate with real data
        const status = {
            expected: 10,
            processed: 0,
            building: false,
        };
        return status;
    }

    ingestLockfile(job: Job): string {
        return job.dir + "/ingest.lock";
    }

    get uploadTime(): number {
        // TODO: populate with real data
        return 0;
    }

    get fileProblems(): Record<string, number> {
        // TODO: populate with real data
        return {
            added: 0,
            deleted: 0,
        };
    }

    get ingestInfo(): string {
        // TODO: populate with real data
        return "";
    }

    get order(): PageOrder {
        if (this._order === null) {
            this._order = PageOrder.fromJob(this.job);
        }
        return this._order;
    }

    set order(order: PageOrder) {
        this._order = order;
    }

    setOrderFromRaw(data: Array<PageRaw>): void {
        this._order = PageOrder.fromRaw(data);
    }

    get documents(): DocumentOrder {
        if (this._documents === null) {
            this._documents = DocumentOrder.fromJob(this._documents);
        }
        return this._documents;
    }

    set documents(documents: DocumentOrder) {
        this._documents = documents;
    }

    setDocumentsFromRaw(data: Array<string>): void {
        this._documents = DocumentOrder.fromRaw(data);
    }

    get raw(): JobMetadataRaw {
        return {
            order: this.order.raw,
            published: this.published,
        };
    }

    set raw(data: JobMetadataRaw) {
        // TODO: set raw data
    }

    save(): void {
        // TODO
    }

    get status(): Record<string, unknown> {
        return {
            derivatives: this.derivativeStatus,
            // TODO: minutes_since_upload: ((Time.new - upload_time) / 60).floor,
            file_problems: this.fileProblems,
            published: this.raw.published,
            // TODO: ingesting: File.exist?(ingest_lockfile),
            // TODO: documents: this.documents.list.length,
            // TODO: audio: audio.list.length,
            ingest_info: this.ingestInfo,
        };
    }
}

export default JobMetadata;
