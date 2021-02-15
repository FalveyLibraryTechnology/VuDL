import Page from './Page'

class PageOrder {
    pages: Array<object> = [];

    constructor(pages) {
        this.pages = pages;
    }

    static fromJob(job) {
        var glob = require("glob");
        var pages = glob.sync(job.dir + ".TI*").map(function(tiff: string){ return new Page(this.basename(tiff), null) });
        return new PageOrder(pages);
    }

    static fromRaw(raw) {
        var pages = raw.map(function(page: string){ return Page.fromRaw(page) });
        return new PageOrder(pages);
    }

    raw() {
        return this.pages.map(function(page: Page){ return page.raw() });

    }

    basename(path) {
        return path.replace(/\/$/, "").split('/').reverse()[0];
     }
}

export default PageOrder;