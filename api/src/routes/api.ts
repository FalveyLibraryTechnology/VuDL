import CategoryCollection from "../models/CategoryCollection";
import Category from "../models/Category";
import Config from "../models/Config";
import Job from "../models/Job";

const express = require("express");
const router = express.Router();

/**
 * @param req
 */
function getJobFromRequest(req): Job {
    // TODO: sanitize parameters!
    return new Job(holdingArea() + req.params.category + "/" + req.params.job);
}

/**
 *
 */
function holdingArea(): string {
    const holdingArea = Config.getInstance().holdingArea();
    return holdingArea.endsWith("/") ? holdingArea : holdingArea + "/";
}

router.get("/", function (req, res, next) {
    const categoryCollection = new CategoryCollection(holdingArea());
    res.send(JSON.stringify(categoryCollection.raw()));
});

router.get("/:category", function (req, res, next) {
    //TODO
    //Sanitize incoming parameters
    //404 error for non-existent catgeory (if holding area + category is not a directory)
    const category = new Category(holdingArea() + req.params.category);
    res.send(JSON.stringify(category.raw()));
});

router.get("/:category/:job", function (req, res, next) {
    res.send(JSON.stringify(getJobFromRequest(req).metadata.raw));
});

router.get("/:category/:job/status", function (req, res, next) {
    res.send(JSON.stringify(getJobFromRequest(req).metadata.status));
});

router.put("/:category/:job/derivatives", function (req, res, next) {
    getJobFromRequest(req).makeDerivatives();
    res.send(JSON.stringify({ status: "ok" }));
});

router.put("/:category/:job/ingest", function (req, res, next) {
    getJobFromRequest(req).ingest();
    res.send(JSON.stringify({ status: "ok" }));
});

router.put("/:category/:job", function (req, res, next) {
    const job = getJobFromRequest(req);
    //TODO
    //job.metadata.validate(job, req.params);
    res.send(JSON.stringify({ status: "ok" }));
});

router.get("/:category/:job/:image/:size", async function (req, res, next) {
    //TODO
    //Sanitize incoming parameters
    const legalSizes: object = {
        thumb: "THUMBNAIL",
        medium: "MEDIUM",
        large: "LARGE",
    };
    const image: string = req.params.image;
    const size: string = req.params.size;
    const job = getJobFromRequest(req);
    const deriv = await job.getImage(image).derivative(legalSizes[size] ?? "THUMBNAIL");
    res.sendFile(deriv);
});

router.delete("/:category/:job/:image/*"),
    async function (req, res, next) {
        //TODO
        //Sanitize incoming parameters
        const image: string = req.params.image;
        const job = getJobFromRequest(req);
        const imageObj = job.getImage(image);
        if (imageObj !== null) {
            imageObj.delete();
            res.send(JSON.stringify({ status: "ok" }));
        } else {
            res.status(404).send(JSON.stringify({ status: "image missing" }));
        }
    };

module.exports = router;
