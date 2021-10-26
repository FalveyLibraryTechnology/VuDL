import express = require("express");
import bodyParser = require("body-parser");
import Config from "../models/Config";
import Fedora from "../services/Fedora";
import FedoraObjectFactory from "../services/FedoraObjectFactory";
import MetadataExtractor from "../services/MetadataExtractor";
import { requireToken } from "./auth";

const router = express.Router();

router.get("/models", requireToken, function (req, res) {
    res.json({ CollectionModels: Config.getInstance().collectionModels, DataModels: Config.getInstance().dataModels });
});

router.post("/object/new", requireToken, bodyParser.json(), async function (req, res) {
    let parentPid = req?.body?.parent;
    if (parentPid !== null && !(parentPid?.length)) {
        parentPid = null;
    }
    const model = req.body?.model;
    if (!model) {
        res.status(400).send("Missing model parameter.");
        return;
    }
    const title = req.body?.title;
    if (!title) {
        res.status(400).send("Missing title parameter.");
        return;
    }
    const state = req.body?.state;
    if (!state) {
        res.status(400).send("Missing state parameter.");
        return;
    }

    // Validate parent PID, if set:
    if (parentPid !== null) {
        const fedora = Fedora.getInstance();
        const extractor = MetadataExtractor.getInstance();
        let relsExt: string;
        try {
            relsExt = await fedora.getDatastreamAsString(parentPid, "RELS-EXT");
        } catch (e) {
            res.status(404).send("Error loading parent PID: " + parentPid);
            return;
        }
        const models = extractor.extractRelations(relsExt).hasModel ?? [];

        // Parents must be collections; validate!
        if (!models.includes("info:fedora/vudl-system:CollectionModel")) {
            res.status(400).send("Illegal parent " + parentPid + "; not a collection!");
            return;
        }
    }
    const factory = FedoraObjectFactory.getInstance();
    try {
        const newObject = await factory.build(
            model.replace("vudl-system:", ""),
            title,
            state,
            parentPid
        );
        res.status(200).send(newObject.pid);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

module.exports = router;
