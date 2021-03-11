import PageOrder from './PageOrder';
import DocumentOrder from './DocumentOrder';
import Job from './Job';

class JobMetadata {
    job: Job;
    _order: PageOrder = null;
    _documents: DocumentOrder = null
    published: boolean = false;

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

    derivativeLockfile() {
        return this.job.dir + '/derivatives.lock';
    }

    derivativeStatus() {
        let status = {
            expected: 10,
            processed: 0,
            building: false
        };
        return status;
    }

    ingestLockfile(job) {
        return job.dir + '/ingest.lock';
    }

    uploadTime() {

    }

    fileProblems() {

    }

    ingestInfo() {

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
            this._documents = DocumentOrder.fromJob(this._documents);
        }
        return this._documents;
    }

    set documents(data) {
        this._documents = DocumentOrder.fromRaw(data);
    }

    get raw() {
        return {
            order: this.order.raw(),
            published: this.published  
        };
    }

    set raw(data) {
        //TO DO: set raw data
    }

    save() {

    }

    get status() {
        return {
            derivatives: this.derivativeStatus()
        };
        /*return {derivatives: this.derivativeStatus,
            minutes_since_upload: ((Time.new - upload_time) / 60).floor,
            file_problems: file_problems,
            published: raw[:published],
            ingesting: File.exist?(ingest_lockfile),
            documents: this.documents.list.length,
            audio: audio.list.length,
            ingest_info: ingest_info } */
    }

}

export default JobMetadata;