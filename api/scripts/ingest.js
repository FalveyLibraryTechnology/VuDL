const CategoryCollection = require("../dist/models/CategoryCollection").default; // eslint-disable-line @typescript-eslint/no-var-requires
const Config = require("../dist/models/Config").default; // eslint-disable-line @typescript-eslint/no-var-requires

const collection = new CategoryCollection(Config.getInstance().holdingArea);
collection.categories.forEach((category) => {
    category.jobs.forEach((job) => {
        job.ingest();
    });
});