import Solr from '../services/Solr';
import SolrIndexer from '../services/SolrIndexer';

var express = require('express');
var router = express.Router();

router.get("/solrindex/:pid", async function(req, res, next) {
    var indexer = new SolrIndexer();
    var fedoraFields = await indexer.getFields(req.params.pid);

    res.send(JSON.stringify(fedoraFields, null, "\t"));
});

router.post("/solrindex/:pid", async function(req, res, next) {
    var indexer = new SolrIndexer();
    var fedoraFields = await indexer.getFields(req.params.pid);
    var solr = new Solr();
    // TODO: make core name configurable
    var result = await solr.indexRecord("biblio", fedoraFields);
    res.status(result.statusCode)
        .send(result.statusCode === 200 ? 'ok' : result.body.error.msg ?? "error");
});

module.exports = router;
