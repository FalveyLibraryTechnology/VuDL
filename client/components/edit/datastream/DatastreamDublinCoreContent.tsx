import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import { useEditorContext } from "../../../context/EditorContext";
import useDatastreamOperation from "../../../hooks/useDatastreamOperation";
import DatastreamDublinCoreValues from "./DatastreamDublinCoreValues";
import DatastreamDublinCoreAddButtons from "./DatastreamDublinCoreAddButtons";

const DatastreamDublinCoreContent = (): React.ReactElement => {
    const fieldCatalog = {
        "dc:title": { "label": "Title", "type": "text" },
        "dc:creator": { "label": "Creator", "type": "text" },
        "dc:subject": { "label": "Subject", "type": "text" },
        "dc:description": { "label": "Description", "type": "html" },
        "dc:publisher": { "label": "Publisher", "type": "text" },
        "dc:contributor": { "label": "Contributor", "type": "text" },
        "dc:date": { "label": "Date", "type": "text" },
        "dc:type": { "label": "Type", "type": "text" },
        "dc:format": { "label": "Format", "type": "dropdown" },
        "dc:identifier": { "label": "Identifier", "type": "locked" },
        "dc:source": { "label": "Source", "type": "text" },
        "dc:language": { "label": "Language", "type": "dropdown" },
        "dc:relation": { "label": "Relation", "type": "text" },
        "dc:coverage": { "label": "Coverage", "type": "text" },
        "dc:rights": { "label": "Rights", "type": "text" },
    };
    const {
        state: { currentPid, objectDetailsStorage },
        action: { toggleDatastreamModal },
    } = useEditorContext();
    const { uploadDublinCore } = useDatastreamOperation();
    const [metadata, setMetadata] = useState({});
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, currentPid);
    useEffect(() => {
        if (loaded) {
            setMetadata(objectDetailsStorage[currentPid].metadata ?? {});
        }
    }, [loaded]);

    return (
        <>
            <DialogContent>
                <Grid container spacing={1}>
                    <Grid item xs={8}><DatastreamDublinCoreValues metadata={metadata} /></Grid>
                    <Grid item xs={4}><DatastreamDublinCoreAddButtons metadata={metadata} setMetadata={setMetadata} fieldCatalog={fieldCatalog} /></Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button
                    className="uploadDublinCoreButton"
                    onClick={async () => {
                        await uploadDublinCore(metadata);
                    }}
                >
                    Save
                </Button>
                <Button onClick={toggleDatastreamModal}>Cancel</Button>
            </DialogActions>
        </>
    );
};

export default DatastreamDublinCoreContent;
