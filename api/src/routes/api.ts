import express = require("express");

import CategoryCollection from "../models/CategoryCollection";
import Category from "../models/Category";
import Config from "../models/Config";
import { getUserBy, makeToken } from "../services/Database";
import Job from "../models/Job";

const router = express.Router();
import { /* allow, */ setupPassport, requireToken } from "./auth";
setupPassport(router);

router.get("/login", async function (req, res) {
    if (req.query.referer ?? false) {
        req.session.referer = req.query.referer;
    }
    const user = await getUserBy("username", "chris");
    res.render("login-test", { user });
    // res.send(`<ul>
    //     <li><a href="/api/user/confirm/${user.hash}">Login</a></li>
    //     <li><a href="/api/secret">Secret</a></li>
    // </ul>`);
});

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("http://localhost:3000");
});

function getJobFromRequest(req): Job {
    // TODO: sanitize parameters!
    return new Job(holdingArea() + req.params.category + "/" + req.params.job);
}

function holdingArea(): string {
    const holdingArea = Config.getInstance().holdingArea;
    return holdingArea.endsWith("/") ? holdingArea : holdingArea + "/";
}

router.get("/", requireToken, function (req, res) {
    const categoryCollection = new CategoryCollection(holdingArea());
    res.json(categoryCollection.raw());
});

router.get("/:category", requireToken, function (req, res) {
    // TODO
    // Sanitize incoming parameters
    // 404 error for non-existent catgeory (if holding area + category is not a directory)
    const category = new Category(holdingArea() + req.params.category);
    res.json(category.raw());
});

router.get("/:category/:job", requireToken, function (req, res) {
    res.json(getJobFromRequest(req).metadata.raw);
});

router.get("/:category/:job/status", requireToken, function (req, res) {
    res.json(getJobFromRequest(req).metadata.status);
});

router.put("/:category/:job/derivatives", requireToken, function (req, res) {
    getJobFromRequest(req).makeDerivatives();
    res.json({ status: "ok" });
});

router.put("/:category/:job/ingest", requireToken, function (req, res) {
    getJobFromRequest(req).ingest();
    res.json({ status: "ok" });
});

router.put("/:category/:job", requireToken, function (req, res) {
    const job = getJobFromRequest(req);
    const raw = req.body;
    try {
        job.metadata.raw = raw;
        const problems = job.metadata.status.file_problems as Record<string, Array<string>>;
        if (problems.added.length > 0 || problems.deleted.length > 0) {
            throw "file problem found";
        }
        job.metadata.save();
        res.json({ status: "ok" });
    } catch (e) {
        res.status(500).json({ status: "error saving job" });
    }
});

router.get("/:category/:job/:image/:size", requireToken, async function (req, res) {
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

router.delete("/:category/:job/:image/*"), requireToken, async function (req, res) {
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
