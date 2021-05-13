import bodyParser = require("body-parser");
import expressSession = require("express-session");
import passport = require("passport");
import hash = require("passport-hash");

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

export const users = [
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
