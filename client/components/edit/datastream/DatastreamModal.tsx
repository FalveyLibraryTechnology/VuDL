import React from "react";
import { Dialog, DialogTitle, Grid, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEditorContext } from "../../../context/EditorContext";
import DatastreamUploadModalContent from "./DatastreamUploadModalContent";
import DatastreamDeleteModalContent from "./DatastreamDeleteModalContent";

const contentMapping = {
    Upload: <DatastreamUploadModalContent />,
    View: null,
    Metadata: null,
    Download: null,
    Delete: <DatastreamDeleteModalContent />,
};

const DatastreamModalContent = ({ datastreamModalState }) => {
    return datastreamModalState ? contentMapping[datastreamModalState] : null;
};

const DatastreamModal = () => {
    const {
        state: { datastreamModalState, isDatastreamModalOpen },
        action: { toggleDatastreamModal },
    } = useEditorContext();

    return (
        <Dialog
            className="datastreamModal"
            open={isDatastreamModalOpen}
            onClose={toggleDatastreamModal}
            fullWidth={true}
        >
            <DialogTitle>
                <Grid container>
                    <Grid item xs={11}>
                        {datastreamModalState}
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton className="closeButton" onClick={toggleDatastreamModal}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DatastreamModalContent datastreamModalState={datastreamModalState} />
        </Dialog>
    );
};

export default DatastreamModal;
