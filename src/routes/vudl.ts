var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('vudl', { title: 'VuDLPrep' });
});
  
module.exports = router;