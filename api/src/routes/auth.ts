import bodyParser = require("body-parser");
import expressSession = require("express-session");
import passport = require("passport");
import hash = require("passport-hash");

import { getUserBy } from "../services/Database";

export function setupPassport(router) {
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
}

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    done(null, await getUserBy("id", id));
});

passport.use(
    new hash.Strategy(async function (hash, done) {
        const user = await getUserBy("hash", hash);
        done(null, user);
    })
);

export function authenticate(req, res, next) {
    // Attempt sign in
    const authMethod = passport.authenticate("hash", { failureRedirect: "/api/login" });
    if (req.header("X-API-Token")) {
        // we can switch tactics here
    }
    authMethod(req, res, next);
}

export function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // TODO: Check for API key header

    // Take ye to login!
    req.session.originalUrl = req.originalUrl;
    console.log("< save login referral: " + req.originalUrl);
    res.redirect("/api/login");
}
