import fs = require("fs");

import AudioOrder from "./AudioOrder";
import { DocumentFileRaw } from "./DocumentFile";
import DocumentOrder from "./DocumentOrder";
import Job from "./Job";
import Image from './ImageFile';
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
        let lockfileExists: boolean = fs.existsSync(this.derivativeLockfile);
        const status = {
            expected: 10,
            processed: 0,
            building: false,
            lockfileExists
        };
        this.order.pages.forEach(element => {
            let image: Image = new Image(this.job.dir + "/" + this.page.filename )
            Object.keys(image.sizes).forEach(key => {
                status.expected += 1;
                if (fs.existsSync(image.derivativePath(key))) {
                    status.processed += 1;
                }
            })
        });
        return status;
    }

    get uploadTime(): number {
        this.order.pages.forEach(element => {
            let getFileUpdatedDate = (path: string = this.job.dir + "/" + this.page.filename) => {
                let file = fs.statSync(path)
                let dir = fs.statSync(this.job.dir)
                if (file != null) {
                    return file.mtime
                } else {
                    return dir.mtime;
                }
                
            }
            return getFileUpdatedDate();
        });
        return this.uploadTime;
    }

    get fileProblems() {
        let fromJson: Array<String> = this.order.raw.map(function(page: PageRaw){ return page.filename});
        let fromFile: Array<String> = PageOrder.fromJob(this.job).raw.map(function(page: PageRaw){ return page.filename});

        return {
            added: fromJson.filter(x => !fromFile.includes(x)) , //fromJson - fromFile
            deleted: fromFile.filter(x => !fromJson.includes(x)) //fromFile - fromJson
        };
    }

    get ingestInfo() {
        let readLastLines = require('read-last-lines');
        let logfile: string = this.job.dir + "/ingest.log";
        if (fs.existsSync(logfile)) {
            return readLastLines.read(logfile, 1)
                .then((lines) => console.log(lines));
        } else {
            return '';
        }
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
            // TODO: minutes_since_upload: ((Time.new - upload_time) / 60).floor,
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
