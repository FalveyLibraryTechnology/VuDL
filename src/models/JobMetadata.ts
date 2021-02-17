import PageOrder from './PageOrder';
import DocumentOrder from './DocumentOrder'

class JobMetadata {
    job: string;
    _order: PageOrder = null;
    _documents: DocumentOrder = null

    constructor(job) {
        this.job = job;
        let fs = require('fs'), filename = job.dir + '/job.json';
        if (fs.existsSync(filename)) {
            var json = fs.readFileSync(filename);
            return json;
        } else {
            return JSON.parse(json);
        }
    }

    raw() {
        
    }

    dc(job) {
        this.job = job;
        let fs = require('fs'), filename = job.dir + '/dc.xml';
        if (fs.existsSync(filename)) {
            return fs.readFileSync(filename);
        }
    }

    derivativeLockfile(job) {
        return job.dir + '/derivatives.lock';
    }

    derivativeStatus() {
        let status = [];

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

    save() {

    }

    status() {

    }

}

export default JobMetadata;