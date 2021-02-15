import CategoryCollection from '../models/CategoryCollection';
import Category from '../models/Category';
import Job from '../models/Job';

var express = require("express");
var router = express.Router();

function holdingArea(): string {
    return "C:/holdingarea/";
}

router.get("/", function(req, res, next) {
    var categoryCollection = new CategoryCollection(holdingArea());
    res.send(JSON.stringify(categoryCollection.raw()));
});

router.get("/:category", function(req, res, next) {
    //TO DO
    //Sanitize incoming parameters
    //404 error for non-existent catgeory (if holding area + category is not a directory)
    var category = new Category(holdingArea() + req.params.category);
    res.send(JSON.stringify(category.raw()));
});

router.get("/:job", function(req, res, next) {
    var job = new Job(holdingArea() + req.params.job);
    //res.send(JSON.stringify(job.metadata.raw()));
});

module.exports = router;