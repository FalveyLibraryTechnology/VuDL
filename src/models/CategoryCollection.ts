class CategoryCollection {
  dir: string;
  glob = require("glob")
  categories: Array<object> = [];
  
  constructor(dir) {
    this.dir = dir;
    this.categories.forEach(element => this.glob("#{dir}/*"), new Category(dir));
  }

  raw() {
    this.categories.map(function (category) {return this.category.raw()});
  }
}

export default CategoryCollection;