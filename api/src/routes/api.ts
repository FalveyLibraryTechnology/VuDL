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
    res.send(JSON.stringify(categoryCollection.raw()));
});

router.get("/:category", function(req, res, next) {
    //TODO
    //Sanitize incoming parameters
    //404 error for non-existent catgeory (if holding area + category is not a directory)
    var category = new Category(holdingArea() + req.params.category);
    res.send(JSON.stringify(category.raw()));
});

router.get("/:category/:job", function(req, res, next) {
    res.send(JSON.stringify(getJobFromRequest(req).metadata.raw));
});

router.get("/:category/:job/status", function(req, res, next) {
    res.send(JSON.stringify(getJobFromRequest(req).metadata.status));
});

router.put("/:category/:job/derivatives", function(req, res, next) {
    getJobFromRequest(req).makeDerivatives();
    res.send(JSON.stringify( { status: 'ok' } ));
});

router.put("/:category/:job/ingest", function(req, res, next) {
    getJobFromRequest(req).ingest();
    res.send(JSON.stringify( { status: 'ok' } ));
});

router.put("/:category/:job", function(req, res, next) {
    let job = getJobFromRequest(req);
    //TODO
    //job.metadata.validate(job, req.params);
    res.send(JSON.stringify( { status: 'ok' } ));
});

router.get("/:category/:job/:image/:size", async function(req, res, next) {
    //TODO
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
    res.sendFile(deriv);
});

router.delete("/:category/:job/:image/*"), async function(req, res, next) {
    //TODO
    //Sanitize incoming parameters
    let image: string = req.params.image;
    let job = getJobFromRequest(req);
    let imageObj = job.getImage(image);
    if (imageObj !== null) {
        imageObj.delete();
        res.send(JSON.stringify( { status: 'ok' } ));
    } else {
        res.status(404).send(JSON.stringify( { status: 'image missing' } ));
    }
}

module.exports = router;
