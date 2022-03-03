import { Category, CategoryRaw } from "./Category";

// We have an indirect dependency on ImageFile, but we don't really want
// to load it for the context of this test.
jest.mock("./ImageFile.ts", () => {
    return {};
});

describe("Category", () => {
    let category: Category;
    beforeEach(() => {
        category = new Category("test1");
    });

    it("should return the directory name", () => {
        expect(category.dir).toEqual("test1");
    });

    it("should return the category and jobs in raw format", () => {
        const categoryRaw: CategoryRaw = category.raw();
        expect(categoryRaw.category).toEqual("test1");
        expect(categoryRaw.jobs).toEqual([]);
    });
});
