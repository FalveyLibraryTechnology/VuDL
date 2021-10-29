import express = require("express");
import Config from "../models/Config";
import HierarchyCollector from "../services/HierarchyCollector";
import { requireToken } from "./auth";
import { sanitizeParameters } from "./sanitize";
const router = express.Router();

const pidSanitizer = sanitizeParameters({ pid: /^[a-zA-Z]+:[0-9]+/ }, /^$/);

router.get("/models", requireToken, function (req, res) {
    res.json({ CollectionModels: Config.getInstance().collectionModels, DataModels: Config.getInstance().dataModels });
});

router.get("/breadcrumbs/:pid", pidSanitizer, requireToken, async function (req, res) {
    try {
        const fedoraData = await HierarchyCollector.getInstance().getHierarchy(req.params.pid, false);
        res.json(fedoraData.getBreadcrumbTrail());
    } catch (e) {
        console.error("Error retrieving breadcrumbs: " + e);
    }
});

module.exports = router;
