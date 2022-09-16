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
    const {
        state: { currentPid, objectDetailsStorage },
        action: { setCurrentDublinCore, toggleDatastreamModal },
    } = useEditorContext();
    const { uploadDublinCore } = useDatastreamOperation();
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, currentPid);
    useEffect(() => {
        if (loaded) {
            setCurrentDublinCore(objectDetailsStorage[currentPid].metadata ?? {});
        }
    }, [loaded]);

    return (
        <>
            <DialogContent>
                <Grid container spacing={1}>
                    <Grid item xs={8}><DatastreamDublinCoreValues /></Grid>
                    <Grid item xs={4}><DatastreamDublinCoreAddButtons /></Grid>
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
