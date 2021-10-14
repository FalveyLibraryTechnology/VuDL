import express = require("express");
import Config from "../models/Config";
const router = express.Router();
import { requireToken } from "./auth";
import { pidSanitizer } from "./sanitize";
import Solr from "../services/Solr";

router.get("/models", requireToken, function (req, res) {
    res.json({ CollectionModels: Config.getInstance().collectionModels, DataModels: Config.getInstance().dataModels });
});

async function getChildren(req, res) {
    const query =
        (req.params.pid ?? "").length > 0
            ? 'hierarchy_parent_id:"' + req.params.pid.replace('"', "") + '"'
            : "-hierarchy_parent_id:*";
    const config = Config.getInstance();
    const solr = Solr.getInstance();
    // TODO: make rows a parameter
    const result = await solr.query(config.solrCore, query, { fl: "id", rows: "100000" });
    if (result.statusCode !== 200) {
        res.status(result.statusCode ?? 500).send("Unexpected Solr response code.");
        return;
    }
    const docs = result?.body?.response?.docs ?? [];
    res.json(docs.map((doc) => doc.id));
}

router.get("/object/children", requireToken, getChildren);
router.get("/object/children/:pid", requireToken, pidSanitizer, getChildren);

module.exports = router;
