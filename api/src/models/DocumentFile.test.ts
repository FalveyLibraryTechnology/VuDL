import { DocumentFile, DocumentFileRaw } from "./DocumentFile";

describe("Document", () => {
    let document: DocumentFile;
    beforeEach(() => {
        document = new DocumentFile("test1", "test2");
    });

    it("should return the filename and label", () => {
        const documentRaw: DocumentFileRaw = document.raw();
        expect(documentRaw.filename).toEqual("test1");
        expect(documentRaw.label).toEqual("test2");
    });

    it("should return from raw", () => {
        const documentRaw: DocumentFileRaw = { filename: "test1", label: "test2" };
        const testPage: DocumentFile = DocumentFile.fromRaw(documentRaw);

        expect(testPage.filename).toEqual("test1");
        expect(testPage.label).toEqual("test2");
    });
});
