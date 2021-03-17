import DocumentFile from './DocumentFile'

class DocumentOrder {
    list: Array<object> = [];

    constructor(list) {
        this.list = list;
    }

    static fromJob(job) {
        var glob = require("glob");
        var list = glob.sync(job.dir + ".PDF").map(function(pdf: string){ return new DocumentFile(this.basename(pdf), "PDF")});
        return new DocumentOrder(list);

    }

    static fromRaw(raw) {
        var list = raw.map(function(list: string){ return DocumentFile.fromRaw(list) });
        return new DocumentOrder(list);

    }

    raw() {
        return this.list.map(function(documentfile: DocumentFile) { return documentfile.raw() });
    }

    basename(path) {
        return path.replace(/\/$/, "").split('/').reverse()[0];
     }
}

export default DocumentOrder;