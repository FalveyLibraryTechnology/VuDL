import Config from "../models/Config";
import Solr from "../services/Solr";
import SolrIndexer from "../services/SolrIndexer";

import express = require("express");
const router = express.Router();

router.get("/solrindex/:pid", async function (req, res) {
    const indexer = new SolrIndexer();
    try {
        const fedoraFields = await indexer.getFields(req.params.pid);
        res.send(JSON.stringify(fedoraFields, null, "\t"));
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message);
    }
});

router.post("/solrindex/:pid", async function (req, res) {
    const indexer = new SolrIndexer();
    let fedoraFields = null;
    try {
        fedoraFields = await indexer.getFields(req.params.pid);
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message);
        return;
    }
    const solr = new Solr();
    const result = await solr.indexRecord(Config.getInstance().solrCore, fedoraFields);
    res.status(result.statusCode).send(
        result.statusCode === 200 ? "ok" : ((result.body ?? {}).error ?? {}).msg ?? "error"
    );
});

module.exports = router;
