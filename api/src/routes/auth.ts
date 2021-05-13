/**
 * TODO
 * - Roles: Paginator or by user
 * - User list and API list, both with permissions
 * - API endpoint to mint keys with set permissions
 *     - Accessible to users
 *     - Can mint keys at user level or below
 *
 * - React
 *     > Is there an API key?
 *         > Stored in React (TODO: review)
 *         ? GET parameter
 *         ? Header (X-API-Key)
 *     > No?
 *         > Ask to mint key
 *         > 401? Redirect to login endpoint (with redirect)
 */

import { Request, Response, Router } from "express"; // Types
import bodyParser = require("body-parser");
import expressSession = require("express-session");
import passport = require("passport");
import hash = require("passport-hash");

import { getUserBy, confirmToken, makeToken } from "../services/Database";

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    getUserBy("id", id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new hash.Strategy(function (hash, done) {
        getUserBy("hash", hash).then((user) => {
            done(null, user);
        });
    })
);

export function authenticate(req: Request, res: Response, next?: (err?: Error) => void): void {
    // Attempt sign in
    const authMethod = passport.authenticate("hash", { failureRedirect: "/api/login" });
    // we can switch tactics here
    if (req.header("Authorization")) {
        console.log("Authorization", req.header("Authorization"));
        // VuDLPrepJS: xhr.setRequestHeader("Authorization", "Token " + this.props.token);
    }
    authMethod(req, res, next);
}

// TODO: Separate levels of permissions
// TODO: Accept referral from GET
export function requireAuth(req: Request, res: Response, next?: (err?: Error) => void): void {
    if (req.isAuthenticated()) {
        return next();
    }
    // TODO: Check for API key header

    // Take ye to login!
    req.session.originalUrl = req.originalUrl;
    console.log("< save login referral: " + req.originalUrl);
    res.redirect("/api/login");
}

export function setupPassport(router: Router): void {
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

    // Use passport.authenticate() as route middleware to authenticate the
    // request.  If authentication fails, the user will be redirected back to the
    // login page.  Otherwise, the primary route function function will be called,
    // which, in this example, will redirect the user to the home page.
    router.get("/user/confirm/:hash", authenticate, function (req, res) {
        console.log("> goto login referral: " + req.session.originalUrl);
        res.redirect(req.session.originalUrl ?? "/api/secret");
        req.session.originalUrl = null;
    });

    router.get("/token/confirm/:token", async function (req, res) {
        const isGood = await confirmToken(req.params.token);
        res.sendStatus(isGood ? 200 : 401);
    });

    router.get("/token/mint", async function (req, res) {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const token = await makeToken(req.user);
        res.json(token);
    });
}
