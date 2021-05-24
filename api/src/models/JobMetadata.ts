import fs = require("fs");

import AudioOrder from "./AudioOrder";
import { DocumentFileRaw } from "./DocumentFile";
import DocumentOrder from "./DocumentOrder";
import Job from "./Job";
import Image from "./ImageFile";
import { PageRaw } from "./Page";
import PageOrder from "./PageOrder";

interface JobMetadataRaw {
    order: Array<PageRaw>;
    published: boolean;
}

class JobMetadata {
    job: Job;
    page: PageRaw;
    _filename: string;
    _order: PageOrder = null;
    _documents: DocumentOrder = null;
    _audio: AudioOrder = null;
    published = false;

    constructor(job: Job) {
        this.job = job;
        this._filename = this.job.dir + "/job.json";
        if (fs.existsSync(this._filename)) {
            const json = fs.readFileSync(this._filename, "utf-8");
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

    ingestLockfile(): string {
        return this.job.dir + "/ingest.lock";
    }

    get raw(): JobMetadataRaw {
        return {
            order: this.order.raw,
            published: this.published,
        };
    }

    set raw(data: JobMetadataRaw) {
        this._order = PageOrder.fromRaw(data.order);
        this.published = data.published;
    }

    get derivativeLockfile(): string {
        return this.job.dir + "/derivatives.lock";
    }

    get derivativeStatus(): Record<string, unknown> {
        const lockfileExists: boolean = fs.existsSync(this.derivativeLockfile);
        const status = {
            expected: 0,
            processed: 0,
            building: lockfileExists,
        };
        this.order.pages.forEach((page) => {
            const image: Image = new Image(this.job.dir + "/" + page.filename);
            Object.keys(image.sizes).forEach((key) => {
                status.expected += 1;
                if (fs.existsSync(image.derivativePath(key))) {
                    status.processed += 1;
                }
            });
        });
        return status;
    }

    get uploadTime(): number {
        const undefined_time = 2000;
        let mtime = undefined_time;
        this.order.pages.forEach((page) => {
            const path: string = this.job.dir + "/" + page.filename;
            const file = fs.statSync(path);
            const current = file.mtime.getTime() / 1000;

            console.log(current);
            if (current != null) {
                if (current > mtime) {
                    mtime = current;
                }
            }
        });
        if (mtime == undefined_time) {
            const dir = fs.statSync(this.job.dir);
            mtime = dir.mtime.getTime() / 1000;
            console.log(mtime);
        }
        return mtime;
    }

    get fileProblems(): Record<string, Array<string>> {
        const fromJson: Array<string> = this.order.raw.map(function (page: PageRaw) {
            return page.filename;
        });
        const fromFile: Array<string> = PageOrder.fromJob(this.job).raw.map(function (page: PageRaw) {
            return page.filename;
        });

        return {
            added: fromJson.filter((x) => !fromFile.includes(x)), //fromJson - fromFile
            deleted: fromFile.filter((x) => !fromJson.includes(x)), //fromFile - fromJson
        };
    }

    get ingestInfo(): string {
        const logfile: string = this.job.dir + "/ingest.log";
        return fs.existsSync(logfile) ? fs.readFileSync(logfile, "utf-8").split("\n").filter(Boolean).pop() : "";
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
            this._documents = DocumentOrder.fromJob(this.job);
        }
        return this._documents;
    }

    set documents(documents: DocumentOrder) {
        this._documents = documents;
    }

    setDocumentsFromRaw(data: Array<DocumentFileRaw>): void {
        this._documents = DocumentOrder.fromRaw(data);
    }

    get audio(): AudioOrder {
        if (this._audio === null) {
            this._audio = AudioOrder.fromJob(this.job);
        }
        return this._audio;
    }

    set audio(order: AudioOrder) {
        this._audio = order;
    }

    setAudioFromRaw(data: Array<Record<string, string>>): void {
        this._audio = AudioOrder.fromRaw(data);
    }

    save(): void {
        fs.writeFileSync(this._filename, JSON.stringify(this.raw), "utf-8");
    }

    get status(): Record<string, unknown> {
        return {
            derivatives: this.derivativeStatus,
            minutes_since_upload: Math.floor((new Date().getTime() / 1000 - this.uploadTime) / 60),
            file_problems: this.fileProblems,
            published: this.raw.published,
            ingesting: fs.existsSync(this.ingestLockfile()),
            documents: this.documents.list.length,
            audio: this.audio.list.length,
            ingest_info: this.ingestInfo,
        };
    }
}

export default JobMetadata;
