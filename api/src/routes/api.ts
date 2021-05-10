import express = require("express");
import expressSession = require("express-session");
import bodyParser = require("body-parser");
import passport = require("passport");
import hash = require("passport-hash");

import CategoryCollection from "../models/CategoryCollection";
import Category from "../models/Category";
import Config from "../models/Config";
import Job from "../models/Job";

const router = express.Router();

// Express session settings
const sess = {
    secret: "a tsp of vanilla makes hot cocoa better",
    resave: false,
    cookie: { secure: false },
    saveUninitialized: false,
};
if (router.get("env") === "production") {
    router.set("trust proxy", 1); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
}

// Passport dependencies and integration
router.use(expressSession(sess));
router.use(bodyParser.urlencoded({ extended: false }));
router.use(passport.initialize());
router.use(passport.session());

const users = [
    { id: 0, username: "chris", password: "air", hash: "V1StGXR8_Z5jdHi6B-myT" },
    { id: 1, username: "geoff", password: "earth", hash: "CuhFfwkebs3RKr1Zo_Do_" },
    { id: 3, username: "dkatz", password: "avatar", hash: "_HPZZ6uCouEU5jy-AYrDd" },
];
function getUserBy(key, val, done) {
    for (let i = 0; i < users.length; i++) {
        if (users[i][key] === val) {
            return done(null, users[i]);
        }
    }
    return done(null, null);
}

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    getUserBy("id", id, done);
});

passport.use(
    new hash.Strategy(function (hash, done) {
        getUserBy("hash", hash, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, { message: "welp" });
            done(null, user);
        });
    })
);

function authenticate(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // Attempt sign in
    const authMethod = passport.authenticate("hash", { failureRedirect: "/api/login" });
    if (req.header("X-API-Token")) {
        // we can switch tactics here
    }
    authMethod(req, res, next);
}

// Use passport.authenticate() as route middleware to authenticate the
// request.  If authentication fails, the user will be redirected back to the
// login page.  Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
router.get("/confirm/:hash", authenticate, function (req, res) {
    res.redirect("/api/secret");
});

router.get("/secret", authenticate, function (req, res) {
    res.json({ ...req.user });
});

router.get("/login", function (req, res) {
    console.log(req.session.originalUrl);
    res.send(`<ul>
        <li><a href="/api/confirm/${users[0].hash}">Login</a></li>
        <li><a href="/api/secret">Secret</a></li>
    </ul>`);
});

router.get("/logout", authenticate, function (req, res) {
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
