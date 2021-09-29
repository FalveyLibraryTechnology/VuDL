/**
 * TODO: Multiple levels of permission
 * - Mint keys at user level or below
 * - Allow different levels in one easy function
 * - Three easy payments of $19.95
 */
import { Request, Response, Router } from "express"; // Types
import passport = require("passport");
import hash = require("passport-hash");

import Config from "../models/Config";
import { getUserBy, confirmToken, makeToken } from "../services/Database";

interface NextFunction {
    (err?: Error): void;
}

const loginPath = "/api/auth/login";

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

export function authenticate(req: Request, res: Response, next?: NextFunction): void {
    const authMethod = passport.authenticate("hash", { failureRedirect: loginPath });
    // we can switch tactics here
    if (req.header("Authorization")) {
        console.log("Authorization", req.header("Authorization"));
    }
    authMethod(req, res, next);
}

function saveSessionReferer(req: Request) {
    req.session.referer = req.query.referer ?? req.header("referer") ?? req.originalUrl;
    console.log("< save login referral: " + req.session.referer);
}

export function requireLogin(req: Request, res: Response, next?: NextFunction): void {
    if (!req.user) {
        saveSessionReferer(req);
        res.redirect(loginPath);
        return;
    }
    next();
}

export async function requireToken(req: Request, res: Response, next?: NextFunction): Promise<void> {
    // Check for API key in header or session
    const userToken = req.header("Authorization") ? req.header("Authorization").slice(6) : req.session.token ?? null;

    if (await confirmToken(userToken)) {
        return next();
    }

    // Take ye to login!
    saveSessionReferer(req);
    res.sendStatus(401);
}

// Express session settings
export const router = Router();
router.use(passport.initialize());
router.use(passport.session());

// Debug sessions
router.use(function (req, res, next) {
    if (req.method === "OPTIONS") {
        return next();
    }
    console.log(`${req.originalUrl} (Session: ${req.sessionID})`);
    for (const key in req.session) {
        if (key == "cookie") {
            continue;
        }
    }
    next();
});

router.get("/login", async function (req, res) {
    if (req.query.referer ?? false) {
        req.session.referer = req.query.referer;
    }
    const user = await getUserBy("username", "chris");
    res.render("login-test", { user });
});

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect(Config.getInstance().clientUrl);
});

// Use passport.authenticate() as route middleware to authenticate the
// request.  If authentication fails, the user will be redirected back to the
// login page.  Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
router.get("/user/confirm/:hash", authenticate, function (req: Request, res: Response) {
    const referral = req.query.referer ?? req.session.referer;
    console.log("> goto login referral: " + referral);
    res.redirect(referral ?? Config.getInstance().clientUrl);
    req.session.referer = null;
});

router.get("/token/confirm/:token", async function (req: Request, res: Response) {
    const isGood = await confirmToken(req.params.token);
    res.sendStatus(isGood ? 200 : 401);
});

router.get("/token/mint", async function (req: Request, res: Response) {
    if (!req.user) {
        return res.sendStatus(401);
    }
    const token = await makeToken(req.user);
    req.session.token = token;
    res.json(token);
});
