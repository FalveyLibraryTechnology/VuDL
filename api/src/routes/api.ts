import express = require("express");

import CategoryCollection from "../models/CategoryCollection";
import Category from "../models/Category";
import Config from "../models/Config";
import Job from "../models/Job";

const router = express.Router();
import { setupPassport, authenticate, requireAuth, users } from "./auth";
setupPassport(router);

// Use passport.authenticate() as route middleware to authenticate the
// request.  If authentication fails, the user will be redirected back to the
// login page.  Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
router.get("/confirm/:hash", authenticate, function (req, res) {
    console.log("> goto login referral: " + req.session.originalUrl);
    res.redirect(req.session.originalUrl ?? "/api/secret");
    req.session.originalUrl = null;
});

router.get("/secret", requireAuth, function (req, res) {
    res.json({ ...req.user });
});

router.get("/login", function (req, res) {
    res.send(`<ul>
        <li><a href="/api/confirm/${users[0].hash}">Login</a></li>
        <li><a href="/api/secret">Secret</a></li>
    </ul>`);
});

router.get("/logout", requireAuth, function (req, res) {
    req.logout();
    res.redirect("/api/login");
});

function getJobFromRequest(req): Job {
    // TODO: sanitize parameters!
    return new Job(holdingArea() + req.params.category + "/" + req.params.job);
}

function holdingArea(): string {
    const holdingArea = Config.getInstance().holdingArea();
    return holdingArea.endsWith("/") ? holdingArea : holdingArea + "/";
}

router.get("/", function (req, res) {
    const categoryCollection = new CategoryCollection(holdingArea());
    res.json(categoryCollection.raw());
});

router.get("/:category", function (req, res) {
    // TODO
    // Sanitize incoming parameters
    // 404 error for non-existent catgeory (if holding area + category is not a directory)
    const category = new Category(holdingArea() + req.params.category);
    res.json(category.raw());
});

router.get("/:category/:job", function (req, res) {
    res.json(getJobFromRequest(req).metadata.raw);
});

router.get("/:category/:job/status", function (req, res) {
    res.json(getJobFromRequest(req).metadata.status);
});

router.put("/:category/:job/derivatives", function (req, res) {
    getJobFromRequest(req).makeDerivatives();
    res.json({ status: "ok" });
});

router.put("/:category/:job/ingest", function (req, res) {
    getJobFromRequest(req).ingest();
    res.json({ status: "ok" });
});

router.put("/:category/:job", function (req, res) {
    // TODO: Save job
    // const job = getJobFromRequest(req);
    // job.metadata.validate(job, req.params);
    res.json({ status: "ok" });
});

router.get("/:category/:job/:image/:size", async function (req, res) {
    //TODO
    //Sanitize incoming parameters
    const legalSizes: Record<string, string> = {
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
            res.json({ status: "ok" });
        } else {
            res.status(404).json({ status: "image missing" });
        }
    };

module.exports = router;
