import SolrIndexer from "../services/SolrIndexer";
import bodyParser = require("body-parser");
import express = require("express");
import Config from "../models/Config";
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

async function queueIndexOperation(pid, action): Promise<void> {
    // Fedora often fires many change events about the same object in rapid succession;
    // we don't want to index more times than we have to, so let's not re-queue anything
    // that is already awaiting indexing.
    const q = new Queue("vudl");
    const jobs = await q.getJobs("wait");
    let lastPidAction = null;
    for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].name === "index" && jobs[i].data.pid === pid) {
            lastPidAction = jobs[i].data.action;
            break;
        }
    }
    if (action === lastPidAction) {
        console.log("Skipping queue; " + pid + " is already awaiting " + action + ".");
    } else {
        await q.add("index", { pid: pid, action: action });
    }
    q.close();
}

router.post("/camel", bodyParser.json(), async function (req, res) {
    const fedoraBase = Config.getInstance().restBaseUrl;
    const idParts = req?.body?.id.replace(fedoraBase, "").split("/");
    if (idParts === null) {
        res.status(400).send("Missing id in body");
        return;
    }
    const pid = idParts[1];
    const datastream = idParts[2] ?? null;
    let action = req?.body?.type.split("#").pop();
    if (action === null) {
        res.status(400).send("Missing type in body");
        return;
    }

    // If we deleted a datastream, we should treat that as an update operation
    // (because we don't want to delete the whole PID!):
    if (datastream !== null && action === "Delete") {
        console.log(pid + " datastream " + datastream + " deleted; updating...");
        action = "Update";
    }

    switch (action) {
        case "Create":
        case "Update":
            await queueIndexOperation(pid, "index");
            break;
        case "Delete":
            await queueIndexOperation(pid, "delete");
            break;
        default: {
            const msg = "Unexpected action: " + action + " (on PID: " + pid + ")";
            console.error(msg);
            res.status(400).send(msg);
            return;
        }
    }

    res.status(200).send("ok");
});

module.exports = router;
