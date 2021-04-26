class DocumentFile {
    filename: string;
    label: string;

    constructor(filename, label) {
        this.filename = filename;
        this.label = label;
    }

    static fromRaw(raw) {
        return new raw["filename"](), raw["label"];
    }

    raw() {
        return { filename: this.filename, label: this.label };
    }
}

export default DocumentFile;
