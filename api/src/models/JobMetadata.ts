import PageOrder from './PageOrder';
import DocumentOrder from './DocumentOrder';
import AudioOrder from './AudioOrder';
import Job from './Job';

class JobMetadata {
    job: Job;
    _filename: string;
    _order: PageOrder = null;
    _documents: DocumentOrder = null;
    _audio: AudioOrder = null;
    published: Boolean = false;

    constructor(job) {
        this.job = job;
        let fs = require('fs'), filename = job.dir + '/job.json';
        if (fs.existsSync(filename)) {
            var json = fs.readFileSync(filename);
            this.raw = JSON.parse(json);            
        }
    }

    dc(job) {
        this.job = job;
        let fs = require('fs'), filename = job.dir + '/dc.xml';
        if (fs.existsSync(filename)) {
            return fs.readFileSync(filename);
        }
    }

    ingestLockfile() {
        return this.job.dir + '/ingest.lock';
    }

    get raw() {
        return {
            order: this.order.raw,
            published: this.published
        };
    }

    set raw(data) {
        this._order = PageOrder.fromRaw(data);
        this.published = true;
    }

    get derivativeLockfile() {
        return this.job.dir + '/derivatives.lock';
    }

    get derivativeStatus() {
        // TODO: populate with real data
        let status = {
            expected: 10,
            processed: 0,
            building: false
        };
        return status;
    }

    get uploadTime() {
        // TODO: populate with real data
        return 0;
    }

    get fileProblems() {
        // TODO: populate with real data
        return {
            added: 0,
            deleted: 0
        };
    }

    get ingestInfo() {
        // TODO: populate with real data
        return '';
    }

    get order() {
        if (this._order === null) {
            this._order = PageOrder.fromJob(this.job);
        }
        return this._order;
    }

    set order(data) {
        this._order = PageOrder.fromRaw(data);
    }

    get documents() {
        if (this._documents === null) {
            this._documents = DocumentOrder.fromJob(this.job);
        }
        return this._documents;
    }

    set documents(data) {
        this._documents = DocumentOrder.fromRaw(data);
    }

    get audio() {
        if (this._audio === null) {
            this._audio = AudioOrder.fromJob(this.job);
        }
        return this._audio;
    }

    set audio(data) {
        this._audio = AudioOrder.fromRaw(data);
    }

    save() {
        let fs = require('fs');
        this._filename = this.job.dir + '/job.json'
        fs.writeFile(this._filename, JSON.stringify(this.raw));
    }

    get status() {
        let fs = require('fs');
        return {
            derivatives: this.derivativeStatus,
            // TODO: minutes_since_upload: ((Time.new - upload_time) / 60).floor,
            file_problems: this.fileProblems,
            published: this.raw.published,
            ingesting: fs.existsSync(this.ingestLockfile()),
            documents: this.documents.list.length,
            audio: this.audio.list.length,
            ingest_info: this.ingestInfo
        };
    }

}

export default JobMetadata;