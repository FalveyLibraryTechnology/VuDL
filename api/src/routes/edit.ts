import express = require("express");
import Config from "../models/Config";
const router = express.Router();
import { setupPassport, requireToken } from "./auth";
import { sanitizeParameters } from "./sanitize";

router.get("/", requireToken, function (req, res) {
    res.json({ CollectionModels: Config.getInstance().collectionModels, DataModels: Config.getInstance().dataModels });
});
