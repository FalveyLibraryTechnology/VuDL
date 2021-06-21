import glob = require("glob");
import path = require("path");

import { DocumentFile, DocumentFileRaw } from "./DocumentFile";
import Job from "./Job";

class DocumentOrder {
    list: Array<DocumentFile> = [];

    constructor(list: Array<DocumentFile>) {
        this.list = list;
    }

    static fromJob(job: Job): DocumentOrder {
        const options: Record<string, unknown> = { nocase: true };
        const list = glob.sync(job.dir + "/*.PDF", options).map(function (pdf: string) {
            return new DocumentFile(path.basename(pdf), "PDF");
        });
        return new DocumentOrder(list);
    }

    static fromRaw(raw: Array<DocumentFileRaw>): DocumentOrder {
        const list = raw.map(function (list) {
            return DocumentFile.fromRaw(list);
        });
        return new DocumentOrder(list);
    }

    raw(): Array<DocumentFileRaw> {
        return this.list.map(function (documentfile: DocumentFile) {
            return documentfile.raw();
        });
    }
}

export default DocumentOrder;
