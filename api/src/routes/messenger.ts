import SolrIndexer from '../services/SolrIndexer';
import JobQueue from '../services/JobQueue';

var express = require('express');
var router = express.Router();

router.get("/solrindex/:pid", async function(req, res, next) {
    var indexer = new SolrIndexer();
    var fedoraFields = await indexer.getFields(req.params.pid);

    res.send(JSON.stringify(fedoraFields, null, "\t"));
});

// TODO: best home?
let jobQueue = new JobQueue(/* TODO: params? */);
jobQueue.start();

module.exports = router;
