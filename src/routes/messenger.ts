import SolrIndexer from '../services/SolrIndexer';

var express = require('express');
var router = express.Router();

router.get("/solrindex/:pid", function(req, res, next) {
    var indexer = new SolrIndexer();
    indexer
        .getFields(req.params.pid) // Promise
        .then(function messengerDC(dc) {
            res.send(JSON.stringify(dc));
        })
});

module.exports = router;
