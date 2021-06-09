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
import passport = require("passport");
import hash = require("passport-hash");

import { getUserBy, confirmToken, makeToken } from "../services/Database";

interface NextFunction {
    (err?: Error): void;
}
interface PermissionHandler {
    (req: Request): boolean;
}
interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): void;
}

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
    // Attempt sign in
    const authMethod = passport.authenticate("hash", { failureRedirect: "/login" });
    // we can switch tactics here
    if (req.header("Authorization")) {
        console.log("Authorization", req.header("Authorization"));
    }
    authMethod(req, res, next);
}

export function allow(...permits: Array<string>): RequestHandler {
    let handlers: Array<PermissionHandler> = [];
    console.log(permits);
    return function (req: Request, res: Response, next?: NextFunction): void {
        const permitted = handlers.reduce(
            (isGood: boolean, handler: PermissionHandler) => isGood && handler(req),
            true
        );
        if (permitted) {
            return next();
        }
        res.redirect("/api/login");
    };
}

// TODO: Separate levels of permissions
// TODO: Accept referral from GET
export function requireAuth(req: Request, res: Response, next?: NextFunction): void {
    // Are we logged in?
    if (req.isAuthenticated()) {
        return next();
    }

    // Take ye to login!
    req.session.referer = req.query.referer ?? req.header("referer");
    console.log("< save login referral: " + req.session.referer);
    res.sendStatus(401);
}

export async function requireToken(req: Request, res: Response, next?: NextFunction): Promise<void> {
    // Check for API key header
    if (req.header("Authorization")) {
        const token = req.header("Authorization").slice(6);
        console.log("Token", token);
        if (await confirmToken(token)) {
            return next();
        }
    }

    // Take ye to login!
    req.session.referer = req.query.referer ?? req.header("referer");
    console.log("< save login referral: " + req.session.referer);
    res.sendStatus(401);
}

export function setupPassport(router: Router): void {
    // Express session settings
    router.use(passport.initialize());
    router.use(passport.session());

    // Debug sessions
    router.use(function (req, res, next) {
        if (req.method === "OPTIONS") {
            return next();
        }
        console.log(`${req.originalUrl} (Session: ${req.sessionID})`);
        for (let key in req.session) {
            if (key == "cookie") {
                continue;
            }
            // console.log("@", key, req.session[key]);
        }
        next();
    });

    // Use passport.authenticate() as route middleware to authenticate the
    // request.  If authentication fails, the user will be redirected back to the
    // login page.  Otherwise, the primary route function function will be called,
    // which, in this example, will redirect the user to the home page.
    router.get("/user/confirm/:hash", authenticate, function (req: Request, res: Response) {
        const referral = req.query.referer ?? req.session.referer;
        console.log("> goto login referral: " + referral);
        res.redirect(referral ?? "/api/secret");
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
        res.json(token);
    });
}
