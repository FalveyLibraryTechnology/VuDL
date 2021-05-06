import glob = require("glob");

import Job from "./Job";
import { Page, PageRaw } from "./Page";

class PageOrder {
    pages: Array<Page> = [];

    constructor(pages: Array<Page>) {
        this.pages = pages;
    }

    static fromJob(job: Job): PageOrder {
        let pattern = job.dir + "/*.TI{F,FF}";
        const options: Record<string, unknown> = { nocase: true };
        // Special case for Windows -- we need to account for drive letters:
        const colonIndex = pattern.indexOf(":");
        if (colonIndex > -1) {
            options.root = pattern.substring(0, colonIndex + 2);
            pattern = pattern.substring(colonIndex + 1);
        }
        const files = glob.sync(pattern, options);
        // TODO: can we rewrite this as a map() for better efficiency?
        const pages = [];
        for (let i = 0; i < files.length; i++) {
            pages[i] = new Page(this.basename(files[i]), null);
        }
        return new PageOrder(pages);
    }

    static fromRaw(raw: Array<PageRaw>): PageOrder {
        const pages = raw.map(function (page: PageRaw) {
            return Page.fromRaw(page);
        });
        return new PageOrder(pages);
    }

    get raw(): Array<PageRaw> {
        return this.pages.map(function (page: Page) {
            return page.raw();
        });
    }

    static basename(path: string): string {
        return path
            .replace(/\\/g, "/") // Windows to Unix
            .replace(/\/$/, "") // Strip last slash
            .split("/") // Split
            .reverse()[0]; // Reverse and take new first
    }
}

export default PageOrder;
