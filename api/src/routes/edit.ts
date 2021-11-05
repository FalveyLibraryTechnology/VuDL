import express = require("express");
import Config from "../models/Config";
const edit = express.Router();
import { requireToken } from "./auth";
import { pidSanitizer } from "./sanitize";
import Solr from "../services/Solr";

edit.get("/models", requireToken, function (req, res) {
    res.json({ CollectionModels: Config.getInstance().collectionModels, DataModels: Config.getInstance().dataModels });
});

async function getChildren(req, res) {
    const query =
        (req.params.pid ?? "").length > 0
            ? `fedora_parent_id_str_mv:"${req.params.pid.replace('"', "")}"`
            : "-fedora_parent_id_str_mv:*";
    const config = Config.getInstance();
    const solr = Solr.getInstance();
    const rows = parseInt(req.query.rows ?? "100000").toString();
    const start = parseInt(req.query.start ?? "0").toString();
    const result = await solr.query(config.solrCore, query, { fl: "id,title", rows, start });
    if (result.statusCode !== 200) {
        res.status(result.statusCode ?? 500).send("Unexpected Solr response code.");
        return;
    }
    const response = result?.body?.response ?? { numFound: 0, start: 0, docs: [] };
    res.json(response);
}

edit.get("/object/children", requireToken, getChildren);
edit.get("/object/children/:pid", requireToken, pidSanitizer, getChildren);

export default edit;
