var express = require('express');
var router = express.Router();

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'VuDLPrep' });
});

router.get("/favicon.ico", async function(req, res, next) {
    res.status(404).send("go away");
});

module.exports = router;
