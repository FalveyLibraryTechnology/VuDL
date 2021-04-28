export interface PageRaw {
    filename: string;
    label: string;
}

export class Page {
    filename: string;
    label: string;

    constructor(filename: string, label: string) {
        this.filename = filename;
        this.label = label;
    }

    static fromRaw(raw: PageRaw): Page {
        return new Page(raw["filename"], raw["label"]);
    }

    raw(): PageRaw {
        return { filename: this.filename, label: this.label };
    }
}

export default Page;
