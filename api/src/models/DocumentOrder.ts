import glob = require("glob");

import { DocumentFile, DocumentFileRaw } from "./DocumentFile";
import Job from "./Job";

class DocumentOrder {
    list: Array<DocumentFile> = [];

    constructor(list: Array<DocumentFile>) {
        this.list = list;
    }

    static fromJob(job: Job): DocumentOrder {
        const list = glob.sync(job.dir + ".PDF").map(function (pdf: string) {
            return new DocumentFile(this.basename(pdf), "PDF");
        });
        return new DocumentOrder(list);
    }

    static fromRaw(raw: Array<string>): DocumentOrder {
        const list = raw.map(function (list: string) {
            return DocumentFile.fromRaw(list);
        });
        return new DocumentOrder(list);
    }

    raw(): Array<DocumentFileRaw> {
        return this.list.map(function (documentfile: DocumentFile) {
            return documentfile.raw();
        });
    }

    basename(path: string): string {
        return path.replace(/\/$/, "").split("/").reverse()[0];
    }
}

export default DocumentOrder;
