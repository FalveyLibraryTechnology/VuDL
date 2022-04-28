/**
 * Module dependencies.
 */

import * as http from "http";
import * as passport from "passport";
import createError from "http-errors";
import * as session from "express-session";
import debug from "debug";

import app from "./app";
import editRouter from "./routes/edit";
import messengerRouter from "./routes/messenger";
import ingestRouter from "./routes/ingest";
import queueRouter from "./routes/queue";
import indexRouter from "./routes/index";
import { requireLogin, authRouter } from "./routes/auth";
import Authentication from "./services/Authentication";

// TODO: Config?
const sess = {
    secret: "vanilla hot cocoa",
    saveUninitialized: true,
    resave: true,
};

// Passport dependencies and integration
app.use(session(sess));
Authentication.getInstance().initializePassport();

app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/ingest", ingestRouter);
app.use("/api/edit", editRouter);
app.use("/messenger", messengerRouter);
app.use("/queue", passport.initialize(), passport.session(), requireLogin, queueRouter);

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

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "9000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, () => console.log("Express started on port " + port));
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const apiDebug = debug("vudlprepjs:server");
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    apiDebug("Listening on " + bind);
}

module.exports = server;
