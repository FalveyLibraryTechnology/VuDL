import React from "react";
import { Dialog, DialogTitle, Grid, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEditorContext } from "../../../context/EditorContext";
import DatastreamUploadModalContent from "./DatastreamUploadModalContent";

const DatastreamModal = () => {
    const {
        state: { isDatastreamModalOpen },
        action: { toggleDatastreamModal },
    } = useEditorContext();

    return (
        <Dialog className="datastreamModal" open={isDatastreamModalOpen} onClose={toggleDatastreamModal}>
            <DialogTitle>
                <Grid container>
                    <Grid item xs={11}>
                        Upload
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton className="closeButton" onClick={toggleDatastreamModal}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DatastreamUploadModalContent />
        </Dialog>
    );
};

export default DatastreamModal;
