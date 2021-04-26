import Category from "./Category";

class CategoryCollection {
    dir: string;
    glob = require("glob");
    categories: Array<object> = [];

    constructor(dir) {
        this.dir = dir;
        this.categories = this.glob.sync(dir + "/*").map(function (dir) {
            return new Category(dir);
        });
    }

    raw() {
        return this.categories.map(function (category: Category) {
            return category.raw();
        });
    }
}

export default CategoryCollection;
