import { createWriteStream, openSync, closeSync, existsSync as fileExists, statSync } from "fs";
import PDFDocument = require("pdfkit");
import path = require("path");

// TODO: reintroduce config when needed: import Config from "./Config";
import Config from "./Config";
import { execSync } from "child_process";
import JobMetadata from "./JobMetadata";
import ImageFile from "./ImageFile";
import { Queue } from "bullmq";

class Job {
    dir: string;
    name: string;
    _metadata: JobMetadata = null;

    constructor(dir: string) {
        this.dir = dir;
        this.name = path.basename(dir);
    }

    ingest(): void {
        const lockfile = this.metadata.ingestLockfile;
        if (this.metadata.published && !fileExists(lockfile)) {
            closeSync(openSync(lockfile, "w")); // touch
            const q = new Queue("vudl");
            q.add("ingest", { dir: this.dir });
        }
    }

    raw(): string {
        return this.name;
    }

    getImage(fileName: string): ImageFile {
        return new ImageFile(this.dir + "/" + fileName);
    }

    makeDerivatives(): void {
        const status = this.metadata.derivativeStatus;
        const lockfile = this.metadata.derivativeLockfile;

        if (status.expected > status.processed && !fileExists(lockfile)) {
            closeSync(openSync(lockfile, "w")); // touch
            const q = new Queue("vudl");
            q.add("derivatives", { dir: this.dir });
        }
    }

    protected async imagesToPdf(jpegs: Array<string>, pdf: string): Promise<void> {
        const pdfObj = new PDFDocument({ autoFirstPage: false });
        const stream = createWriteStream(pdf);
        pdfObj.pipe(stream);
        for (const jpeg of jpegs) {
            const img = pdfObj.openImage(jpeg);
            pdfObj.addPage({ size: [img.width, img.height] }).image(img, 0, 0);
        }
        pdfObj.end();
        // Wait for the PDF to finish generating (i.e. for the write stream to be closed):
        await new Promise<void>((resolve) => {
            stream.on("finish", function () {
                resolve();
            });
        });
    }

    protected async getLargeJpegs(): Promise<Array<string>> {
        const pages = this.metadata.order.pages;
        const jpegs = [];
        for (const i in pages) {
            const image = new ImageFile(this.dir + "/" + pages[i].filename);
            jpegs[i] = await image.derivative("LARGE");
        }
        return jpegs;
    }

    async generatePdf(): Promise<string> {
        const filename = this.dir + "/pages.pdf";
        const jpegs = await this.getLargeJpegs();
        await this.imagesToPdf(jpegs, filename);
        if (!fileExists(filename)) {
            throw "Problem generating PDF: " + filename;
        }

        const ocrmypdf = Config.getInstance().ocrmypdfPath;
        if (ocrmypdf) {
            const ocrmypdfCommand = ocrmypdf + " " + filename + " " + filename;
            execSync(ocrmypdfCommand);
        }

        const stats = statSync(filename);
        if (stats.size < 1) {
            throw "Empty PDF generated: " + filename;
        }
        return filename;
    }

    get metadata(): JobMetadata {
        if (this._metadata === null) {
            this._metadata = new JobMetadata(this);
        }
        return this._metadata;
    }
}

export default Job;
