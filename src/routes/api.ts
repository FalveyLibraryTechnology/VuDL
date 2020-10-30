import CategoryCollection from '../models/CategoryCollection';

var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
    var categoryCollection = new CategoryCollection('C:/holdingarea');
    res.send(JSON.stringify(categoryCollection.raw()));
});

module.exports = router;