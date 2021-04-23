import CategoryCollection from '../models/CategoryCollection';
import Category from '../models/Category';
import Config from '../models/Config';
import Job from '../models/Job';

var express = require("express");
var router = express.Router();

function getJobFromRequest(req): Job {
    // TODO: sanitize parameters!
    return new Job(holdingArea() + req.params.category + '/' + req.params.job);
}

function holdingArea(): string {
    var holdingArea = Config.getInstance().holdingArea();
    return (holdingArea.endsWith('/'))
        ? holdingArea : holdingArea + '/';
}

router.get("/", function(req, res, next) {
    var categoryCollection = new CategoryCollection(holdingArea());
    res.json(categoryCollection.raw());
});

router.get("/:category", function(req, res, next) {
    //TO DO
    //Sanitize incoming parameters
    //404 error for non-existent catgeory (if holding area + category is not a directory)
    var category = new Category(holdingArea() + req.params.category);
    res.json(category.raw());
});

router.get("/:category/:job", function(req, res, next) {
    res.json(getJobFromRequest(req).metadata.raw);
});

router.get("/:category/:job/status", function(req, res, next) {
    res.json(getJobFromRequest(req).metadata.status);
});

router.put("/:category/:job/derivatives", function(req, res, next) {
    getJobFromRequest(req).makeDerivatives();
    res.json( { status: 'ok' } );
});

router.put("/:category/:job/ingest", function(req, res, next) {
    getJobFromRequest(req).ingest();
    res.json( { status: 'ok' } );
});

router.put("/:category/:job", function(req, res, next) {
    //res.json(getJobFromRequest(req).metadata.upda);
    //res.json( { status: 'ok' } );
});

router.get("/:category/:job/:image/:size", async function(req, res, next) {
    //TO DO
    //Sanitize incoming parameters
    let legalSizes: object = {
        thumb: "THUMBNAIL",
        medium: "MEDIUM",
        large: "LARGE"
    };
    let image: string = req.params.image;
    let size: string = req.params.size;
    let job = getJobFromRequest(req);
    let deriv = await job.getImage(image).derivative(legalSizes[size] ?? "THUMBNAIL");
    console.log(deriv);
    res.sendFile(deriv);
});

module.exports = router;
