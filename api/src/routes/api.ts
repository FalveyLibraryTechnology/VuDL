import CategoryCollection from "../models/CategoryCollection";
import Category from "../models/Category";
import Config from "../models/Config";
import Job from "../models/Job";

import express = require("express");
const router = express.Router();

/**
 * Create job from req
 *
 * @param req Request, needs category and job GET parameters
 */
function getJobFromRequest(req): Job {
    // TODO: sanitize parameters!
    return new Job(holdingArea() + req.params.category + "/" + req.params.job);
}

/**
 * Returns the path to the holding area
 */
function holdingArea(): string {
    const holdingArea = Config.getInstance().holdingArea();
    return holdingArea.endsWith("/") ? holdingArea : holdingArea + "/";
}

router.get("/", function (req, res) {
    const categoryCollection = new CategoryCollection(holdingArea());
    res.send(JSON.stringify(categoryCollection.raw()));
});

router.get("/:category", function (req, res) {
    //TODO
    //Sanitize incoming parameters
    //404 error for non-existent catgeory (if holding area + category is not a directory)
    const category = new Category(holdingArea() + req.params.category);
    res.send(JSON.stringify(category.raw()));
});

router.get("/:category/:job", function (req, res) {
    res.send(JSON.stringify(getJobFromRequest(req).metadata.raw));
});

router.get("/:category/:job/status", function (req, res) {
    res.send(JSON.stringify(getJobFromRequest(req).metadata.status));
});

router.put("/:category/:job/derivatives", function (req, res) {
    getJobFromRequest(req).makeDerivatives();
    res.send(JSON.stringify({ status: "ok" }));
});

router.put("/:category/:job/ingest", function (req, res) {
    getJobFromRequest(req).ingest();
    res.send(JSON.stringify({ status: "ok" }));
});

router.put("/:category/:job", function (req, res) {
    // TODO
    // const job = getJobFromRequest(req);
    // job.metadata.validate(job, req.params);
    res.send(JSON.stringify({ status: "ok" }));
});

router.get("/:category/:job/:image/:size", async function (req, res) {
    //TODO
    //Sanitize incoming parameters
    const legalSizes: Record<string, unknown> = {
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
    async function (req, res) {
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
