import express = require("express");
import Config from "../models/Config";
const edit = express.Router();
import { requireToken } from "./auth";

edit.get("/models", requireToken, function (req, res) {
    res.json({ CollectionModels: Config.getInstance().collectionModels, DataModels: Config.getInstance().dataModels });
});

export default edit;
