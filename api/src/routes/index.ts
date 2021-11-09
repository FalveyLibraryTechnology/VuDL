import express = require("express");
const index = express.Router();

index.use(function timeLog(req, res, next) {
    console.log("Time: ", Date.now());
    next();
});

/* GET home page. */
index.get("/", function (req, res) {
    res.render("index", { title: "VuDLPrep" });
});

index.get("/favicon.ico", async function (req, res) {
    res.status(404).send("go away");
});

export default index;
