import SolrIndexer from "../services/SolrIndexer";

import express = require("express");
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

async function queueIndexOperation(pid): Promise<void> {
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
}

router.post("/camel", async function (req, res) {
    const pid = req.headers["org.fcrepo.jms.identifier"].split("/")[1];
    const action = req.headers["org.fcrepo.jms.eventtype"].split("#").pop();

    switch (action) {
        case "Create":
        case "Update":
            await queueIndexOperation(pid);
            break;
        case "Delete":
            // TODO: handle deletes
            break;
        default:
            const msg = "Unexpected action: " + action + " (on PID: " + pid + ")";
            console.error(msg);
            res.status(400).send(msg);
            return;
    }

    res.status(200).send("ok");
});

module.exports = router;
