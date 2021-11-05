import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as path from "path";
import * as logger from "morgan";
import Config from "./models/Config";

const app = express();

// Configure view engine to render EJS templates.
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Session/Credential CrossSite permissions
app.use(function (req, res, next) {
    if (Config.getInstance().allowedOrigins.indexOf(req.headers.origin) > -1) {
        res.set("Access-Control-Allow-Credentials", "true");
        res.set("Access-Control-Allow-Headers", "Authorization,Content-Type");
        res.set("Access-Control-Allow-Origin", req.headers.origin);
        res.set("Access-Control-Allow-Methods", "GET,HEAD,POST,PUT,DELETE");
    } else {
        // allow other origins to make unauthenticated CORS requests
        res.set("Access-Control-Allow-Origin", "*");
    }
    next();
});

export default app;
