import SolrIndexer from '../services/SolrIndexer';

var express = require('express');
var router = express.Router();

router.get("/solrindex/:pid", function(req, res, next) {
    var indexer = new SolrIndexer(req.params.pid);
    res.send(JSON.stringify(indexer.getFields()));
});

module.exports = router;