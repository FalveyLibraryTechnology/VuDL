import glob = require("glob");
import path = require("path");

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
        // Sort ignoring extensions, otherwise "a_back.tif" sorts before "a.tif"
        // due to comparison between "." and "_".
        files.sort((a: string, b: string): number => {
            const aParts: Array<string> = a.split(".");
            const bParts: Array<string> = b.split(".");
            const firstPartResults: number = aParts[0].localeCompare(bParts[0]);
            return firstPartResults === 0 ? a.localeCompare(b) : firstPartResults;
        });
        const pages = files.map((file) => {
            return new Page(path.basename(file), null);
        });
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
}

export default PageOrder;
