/* eslint @typescript-eslint/no-var-requires: "off"
   ------
   Only applies to Typescript files */

const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./dist/routes/index");
const apiRouter = require("./dist/routes/api");
const messengerRouter = require("./dist/routes/messenger");

const app = express();
const ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:9000"];

// Configure view engine to render EJS templates.
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Session/Credential CrossSite permissions
// app.use(cors());
app.use(function (req, res, next) {
    if (ALLOWED_ORIGINS.indexOf(req.headers.origin) > -1) {
        res.set("Access-Control-Allow-Credentials", "true");
        res.set("Access-Control-Allow-Headers", "Authorization");
        res.set("Access-Control-Allow-Origin", req.headers.origin);
    } else {
        // allow other origins to make unauthenticated CORS requests
        res.set("Access-Control-Allow-Origin", "*");
    }
    next();
});

// TODO: Config?
const sess = {
    secret: "vanilla hot cocoa",
    saveUninitialized: true,
    resave: true,
};
if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    // sess.cookie.secure = true; // serve secure cookies
}

// Passport dependencies and integration
app.use(session(sess));

app.use("/", indexRouter);
app.use("/api", apiRouter);
app.use("/messenger", messengerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
