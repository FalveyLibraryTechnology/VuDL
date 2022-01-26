import {Category, CategoryRaw} from './Category';

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