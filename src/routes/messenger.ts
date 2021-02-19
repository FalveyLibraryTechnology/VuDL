import SolrIndexer from '../services/SolrIndexer';

var express = require('express');
var router = express.Router();

router.get("/solrindex/:pid", function(req, res, next) {
    var indexer = new SolrIndexer();
    res.send(JSON.stringify(indexer.getFields(req.params.pid)));
});

module.exports = router;