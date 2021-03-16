import CategoryCollection from '../models/CategoryCollection';
import Category from '../models/Category';
import Config from '../models/Config';
import Job from '../models/Job';

var express = require("express");
var router = express.Router();

function holdingArea(): string {
    return Config.getInstance().holdingArea();
}

router.get("/", function(req, res, next) {
    var categoryCollection = new CategoryCollection(holdingArea());
    res.send(JSON.stringify(categoryCollection.raw()));
});

router.get("/:category", function(req, res, next) {
    console.log("category route");
    //TO DO
    //Sanitize incoming parameters
    //404 error for non-existent catgeory (if holding area + category is not a directory)
    var category = new Category(holdingArea() + req.params.category);
    res.send(JSON.stringify(category.raw()));
});

router.get("/:category/:job", function(req, res, next) {
    var job = new Job(holdingArea() + req.params.job);
    res.send(JSON.stringify(job.metadata.raw));
});

router.get("/:category/:job/status", function(req, res, next) {
    var job = new Job(holdingArea() + req.params.job);
    res.send(JSON.stringify(job.metadata.status)); 
});

router.put("/:category/:job/derivatives", function(req, res, next) {
    var job = new Job(holdingArea() + req.params.job);
    job.makeDerivatives();
    res.send(JSON.stringify( { status: 'ok' } )); 

    /*Job.new(job_path(params)).make_derivatives
    render json: { status: 'ok' }
     */
});

module.exports = router;