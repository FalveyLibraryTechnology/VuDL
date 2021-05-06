import express = require("express");
const router = express.Router();

router.use
(function timeLog(req, res, next) {
    console.log("Time: ", Date.now());
    next();
});

/* GET home page. */
router.get("/", function (req, res) {
    res.render("index", { title: "VuDLPrep" });
});

router.get("/favicon.ico", async function (req, res) {
    res.status(404).send("go away");
});

module.exports = router;
