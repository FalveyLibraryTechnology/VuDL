import SolrIndexer from '../services/SolrIndexer';

var express = require('express');
var router = express.Router();

router.get("/solrindex/:pid", async function(req, res, next) {
    var indexer = new SolrIndexer();
    var fedoraFields = await indexer.getFields(req.params.pid);

    res.send(JSON.stringify(fedoraFields, null, "\t"));
});

module.exports = router;
