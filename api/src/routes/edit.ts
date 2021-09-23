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
    const fedora = Fedora.getInstance();
    const extractor = MetadataExtractor.getInstance();
    const relsExt = await fedora.getDatastreamAsString(req.body.parent, "RELS-EXT");
    const models = extractor.extractRelations(relsExt).hasModel ?? [];

    // Parents must be collections; validate!
    if (!models.includes("info:fedora/vudl-system:CollectionModel")) {
        res.status(400).send("Illegal parent " + req.body.parent + "; not a collection!");
        return;
    }

    const factory = FedoraObjectFactory.getInstance();
    try {
        const newObject = await factory.build(
            req.body.model.replace("vudl-system:", ""),
            req.body.title,
            req.body.state,
            req.body.parent
        );
        res.status(200).send(newObject.pid);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

module.exports = router;
