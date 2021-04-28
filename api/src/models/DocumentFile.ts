export interface DocumentFileRaw {
    filename: string;
    label: string;
}

export class DocumentFile {
    filename: string;
    label: string;

    constructor(filename: string, label: string) {
        this.filename = filename;
        this.label = label;
    }

    static fromRaw(raw: DocumentFileRaw): DocumentFile {
        return new DocumentFile(raw.filename, raw.label);
    }

    raw(): DocumentFileRaw {
        return { filename: this.filename, label: this.label };
    }
}

export default DocumentFile;
