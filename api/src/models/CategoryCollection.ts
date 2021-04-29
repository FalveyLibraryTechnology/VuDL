import glob = require("glob");

import { Category, CategoryRaw } from "./Category";

class CategoryCollection {
    dir: string;
    categories: Array<Category> = [];

    constructor(dir: string) {
        this.dir = dir;
        this.categories = glob.sync(dir + "/*").map(function (dir) {
            return new Category(dir);
        });
    }

    raw(): Array<CategoryRaw> {
        return this.categories.map(function (category: Category) {
            return category.raw();
        });
    }
}

export default CategoryCollection;
