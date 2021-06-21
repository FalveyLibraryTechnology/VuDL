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
        let pattern = job.dir + "/*.PDF";
        const options: Record<string, unknown> = { nocase: true };
        // Special case for Windows -- we need to account for drive letters:
        const colonIndex = pattern.indexOf(":");
        if (colonIndex > -1) {
            options.root = pattern.substring(0, colonIndex + 2);
            pattern = pattern.substring(colonIndex + 1);
        }
        const list = glob.sync(pattern, options).map(function (pdf: string) {
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
