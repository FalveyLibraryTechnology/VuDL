import { Page, PageRaw } from "./Page";

describe("Page", () => {
    let page: Page;
    beforeEach(() => {
        page = new Page("test1", "test2");
    });

    it("should return the filename and label", () => {
        const pageRaw: PageRaw = page.raw();
        expect(pageRaw.filename).toEqual("test1");
        expect(pageRaw.label).toEqual("test2");
    });

    it("should return from raw", () => {
        const pageRaw: PageRaw = { filename: "test1", label: "test2" };
        const testPage: Page = Page.fromRaw(pageRaw);

        expect(testPage.filename).toEqual("test1");
        expect(testPage.label).toEqual("test2");
    });
});
