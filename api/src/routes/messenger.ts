import SolrIndexer from "../services/SolrIndexer";

import express = require("express");
import bodyParser = require("body-parser");
import { Queue } from "bullmq";
import { requireToken } from "./auth";
import { sanitizeParameters } from "./sanitize";
const router = express.Router();

const pidSanitizer = sanitizeParameters({ pid: /^[a-zA-Z]+:[0-9]+/ }, /^$/);

router.post("/pdfgenerator/:pid", pidSanitizer, requireToken, async function (req, res) {
    const q = new Queue("vudl");
    await q.add("generatepdf", { pid: req.params.pid });
    q.close();
    res.status(200).send("ok");
});

router.get("/solrindex/:pid", pidSanitizer, requireToken, async function (req, res) {
    const indexer = SolrIndexer.getInstance();
    try {
        const fedoraFields = await indexer.getFields(req.params.pid);
        res.send(JSON.stringify(fedoraFields, null, "\t"));
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message);
    }
});

router.post("/solrindex/:pid", pidSanitizer, requireToken, async function (req, res) {
    const indexer = SolrIndexer.getInstance();
    try {
        const result = await indexer.indexPid(req.params.pid);
        res.status(result.statusCode).send(
            result.statusCode === 200 ? "ok" : ((result.body ?? {}).error ?? {}).msg ?? "error"
        );
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message);
    }
});

router.post("/camel", bodyParser.text(), async function (req, res) {
    // TODO: determine the pid in a more appropriate way
    const pid = req.body;

    // Fedora often fires many change events about the same object in rapid succession;
    // we don't want to index more times than we have to, so let's not re-queue anything
    // that is already awaiting indexing.
    const q = new Queue("vudl");
    const jobs = await q.getJobs("wait");
    let indexNeeded = true;
    for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].name === "index" && jobs[i].data.pid === pid) {
            indexNeeded = false;
            console.log("Skipping queue; " + pid + " is already awaiting indexing.");
            break;
        }
    }
    if (indexNeeded) {
        await q.add("index", { pid: pid });
    }
    q.close();

    res.status(200).send("ok");
});

module.exports = router;
