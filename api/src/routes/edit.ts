import express = require("express");
import bodyParser = require("body-parser");
import Config from "../models/Config";
import Fedora from "../services/Fedora";
import FedoraCatalog from "../services/FedoraCatalog";
import { FedoraObject } from "../models/FedoraObject";
import DatastreamManager from "../services/DatastreamManager";
import FedoraObjectFactory from "../services/FedoraObjectFactory";
import FedoraDataCollector from "../services/FedoraDataCollector";
import MetadataExtractor from "../services/MetadataExtractor";
import { requireToken } from "./auth";
import { datastreamSanitizer, pidSanitizer } from "./sanitize";
import * as formidable from "formidable";
import Solr from "../services/Solr";
import FedoraDataCollection from "../models/FedoraDataCollection";
const edit = express.Router();

edit.get("/models", requireToken, function (req, res) {
    res.json({ CollectionModels: Config.getInstance().collectionModels, DataModels: Config.getInstance().dataModels });
});

edit.get("/catalog", requireToken, function (req, res) {
    res.json({ models: FedoraCatalog.getInstance().getCompleteCatalog() });
});

edit.get("/catalog/models", requireToken, function (req, res) {
    res.json(FedoraCatalog.getInstance().getModelCatalog());
});

edit.get("/catalog/datastreams", requireToken, function (req, res) {
    res.json(FedoraCatalog.getInstance().getDatastreamCatalog());
});

edit.get("/catalog/datastreammimetypes", requireToken, function (req, res) {
    res.json(FedoraCatalog.getInstance().getDatastreamMimetypes());
});

edit.post("/object/new", requireToken, bodyParser.json(), async function (req, res) {
    let parentPid = req?.body?.parent;
    if (parentPid !== null && !parentPid?.length) {
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
        const collector = FedoraDataCollector.getInstance();
        let parent: FedoraDataCollection;
        try {
            parent = await collector.getObjectData(parentPid);
        } catch (e) {
            res.status(404).send("Error loading parent PID: " + parentPid);
            return;
        }
        // Parents must be collections; validate!
        if (!parent.models.includes("vudl-system:CollectionModel")) {
            res.status(400).send("Illegal parent " + parentPid + "; not a collection!");
            return;
        }
    }
    const factory = FedoraObjectFactory.getInstance();
    try {
        const newObject = await factory.build(model.replace("vudl-system:", ""), title, state, parentPid);
        res.status(200).send(newObject.pid);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

async function getChildren(req, res) {
    const query =
        (req.params.pid ?? "").length > 0
            ? `fedora_parent_id_str_mv:"${req.params.pid.replace('"', "")}"`
            : "-fedora_parent_id_str_mv:*";
    const config = Config.getInstance();
    const solr = Solr.getInstance();
    const rows = parseInt(req.query.rows ?? "100000").toString();
    const start = parseInt(req.query.start ?? "0").toString();
    const result = await solr.query(config.solrCore, query, { fl: "id,title", rows, start });
    if (result.statusCode !== 200) {
        res.status(result.statusCode ?? 500).send("Unexpected Solr response code.");
        return;
    }
    const response = result?.body?.response ?? { numFound: 0, start: 0, docs: [] };
    res.json(response);
}

function uploadFile(req, res, next) {
    const { pid, stream } = req.params;
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        try {
            const datastream = DatastreamManager.getInstance();
            const { filepath, mimetype } = files?.file;
            await datastream.uploadFile(pid, stream, filepath, mimetype);
            res.status(200).send("Upload success");
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
}
edit.post("/object/:pid/datastream/:stream", requireToken, datastreamSanitizer, uploadFile);

edit.get("/object/:pid/modelsdatastreams", requireToken, pidSanitizer, async function (req, res) {
    try {
        const data = await FedoraDataCollector.getInstance().getObjectData(req.params.pid);
        res.json({ models: data.models, datastreams: data.fedoraDatastreams });
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});
edit.get("/topLevelObjects", requireToken, getChildren);
edit.get("/object/:pid/children", requireToken, pidSanitizer, getChildren);
edit.get("/object/:pid/details", requireToken, pidSanitizer, async function (req, res) {
    const pid = req.params.pid;
    const obj = FedoraObject.build(pid);
    const sort = await obj.getSort();
    const metadata = await Fedora.getInstance().getDublinCore(pid);
    const extractedMetadata = MetadataExtractor.getInstance().extractMetadata(metadata);
    res.json({ pid, sort, metadata: extractedMetadata });
});

edit.get("/object/:pid/parents", pidSanitizer, requireToken, async function (req, res) {
    try {
        const fedoraData = await FedoraDataCollector.getInstance().getHierarchy(req.params.pid);
        res.json(fedoraData.getParentTree());
    } catch (e) {
        console.error("Error retrieving breadcrumbs: " + e);
        res.status(500).send("Unexpected error!!");
    }
});

edit.get("/object/:pid/datastream/:stream/download", datastreamSanitizer, requireToken, async function (req, res) {
    const pid = req.params.pid;
    const stream = req.params.stream;
    const datastream = DatastreamManager.getInstance();
    try {
        const mimeType = await datastream.getMimeType(pid, stream);
        const fileType = mimeType?.split("/")?.[1];
        const fileName = `${pid.replace(/:/g, "_")}_${stream}.${fileType}`;
        const buffer = await datastream.downloadBuffer(pid, stream);
        res.header({
            "Access-Control-Expose-Headers": "Content-Disposition",
            "Content-Disposition": `attachment; filename=${fileName}`,
            "Content-Type": mimeType,
        });
        res.status(200).send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

edit.delete("/object/:pid/datastream/:stream", requireToken, datastreamSanitizer, async function (req, res) {
    const pid = req.params.pid;
    const stream = req.params.stream;
    const datastreamManager = DatastreamManager.getInstance();

    try {
        await datastreamManager.deleteDatastream(pid, stream);
        res.status(200).send("Datastream successfully deleted");
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

export default edit;
