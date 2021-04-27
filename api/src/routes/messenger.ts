import SolrIndexer from "../services/SolrIndexer";

import express = require("express");
const router = express.Router();

router.get("/solrindex/:pid", async function (req, res) {
    const indexer = new SolrIndexer();
    const fedoraFields = await indexer.getFields(req.params.pid);

    res.send(JSON.stringify(fedoraFields, null, "\t"));
});

module.exports = router;
