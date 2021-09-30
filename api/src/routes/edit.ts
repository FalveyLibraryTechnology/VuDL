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
    let parentPid = req.body.parent ?? null;
    if (parentPid !== null && parentPid.length === 0) {
        parentPid = null;
    }
    const noParent = (req.body.noParent ?? "0") === "1";

    // Validate parent parameters:
    if (noParent && parentPid !== null) {
        res.status(400).send("Cannot set parent PID and no parent PID");
        return;
    }
    if (!noParent && parentPid === null) {
        res.status(400).send("Must set either parent or noParent");
        return;
    }
    // Validate parent PID, if set:
    if (parentPid !== null) {
        const fedora = Fedora.getInstance();
        const extractor = MetadataExtractor.getInstance();
        const relsExt = await fedora.getDatastreamAsString(req.body.parent, "RELS-EXT");
        const models = extractor.extractRelations(relsExt).hasModel ?? [];

        // Parents must be collections; validate!
        if (!models.includes("info:fedora/vudl-system:CollectionModel")) {
            res.status(400).send("Illegal parent " + req.body.parent + "; not a collection!");
            return;
        }
    }

    const factory = FedoraObjectFactory.getInstance();
    try {
        const newObject = await factory.build(
            req.body.model.replace("vudl-system:", ""),
            req.body.title,
            req.body.state,
            parentPid
        );
        res.status(200).send(newObject.pid);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

module.exports = router;
