import { Request, Response, Router } from "express"; // Types
import passport = require("passport");
import Config from "../models/Config";
import Database from "../services/Database";

interface NextFunction {
    (err?: Error): void;
}

const loginPath = "/api/auth/login";
const authStrategy = Config.getInstance().authenticationStrategy;

export function authenticate(req: Request, res: Response, next?: NextFunction): void {
    const authMethod = passport.authenticate(authStrategy, { failureRedirect: loginPath });
    // we can switch tactics here
    if (req.header("Authorization")) {
        console.log("Authorization", req.header("Authorization"));
    }
    authMethod(req, res, next);
}

function saveSessionReferer(req: Request) {
    req.session.referer = req.originalUrl;
    console.log("< save login referral: " + req.session.referer);
}

export function requireLogin(req: Request, res: Response, next?: NextFunction): void {
    if (req.user) {
        return next();
    }
    saveSessionReferer(req);
    res.redirect(loginPath);
}

export async function requireToken(req: Request, res: Response, next?: NextFunction): Promise<void> {
    // Check for API key in header or session
    const userToken = req.header("Authorization") ? req.header("Authorization").slice(6) : req.session.token ?? null;

    if (await Database.getInstance().confirmToken(userToken)) {
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

function saveReferer(req, res, next) {
    if (req.query.referer ?? false) {
        req.session.referer = req.query.referer;
    }
    next();
}

function showLoginForm(req, res) {
    res.render("../../views/login", { requirePasswords: Config.getInstance().authenticationRequirePasswords });
}

function postLoginRedirect(req, res) {
    const referral = req.query.referer ?? req.session.referer;
    console.log("> goto login referral: " + referral);
    res.redirect(referral ?? Config.getInstance().clientUrl);
    req.session.referer = null;
}

// We have a different login flow depending on whether or not there's a login screen...
const loginFlow =
    authStrategy === "saml" ? [saveReferer, authenticate, postLoginRedirect] : [saveReferer, showLoginForm];
router.get("/login", ...loginFlow);

// Use passport.authenticate() as route middleware to authenticate the
// request.  If authentication fails, the user will be redirected back to the
// login page.  Otherwise, the primary route function will be called,
// which, in this example, will redirect the user to the referring URL.
router.post("/login", authenticate, postLoginRedirect);

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect(Config.getInstance().clientUrl);
});

router.get("/token/confirm/:token", async function (req: Request, res: Response) {
    const isGood = await Database.getInstance().confirmToken(req.params.token);
    res.sendStatus(isGood ? 200 : 401);
});

router.get("/token/mint", async function (req: Request, res: Response) {
    if (!req.user) {
        return res.sendStatus(401);
    }
    const token = await Database.getInstance().makeToken(req.user);
    req.session.token = token;
    res.json(token);
});
