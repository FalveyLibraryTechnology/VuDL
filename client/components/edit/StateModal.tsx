import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useEditorContext } from "../../context/EditorContext";

const StateModal = (): React.ReactElement => {
    const {
        state: { isStateModalOpen },
        action: { toggleStateModal },
    } = useEditorContext();

    return (
        <Dialog
            className="stateModal"
            open={isStateModalOpen}
            onClose={toggleStateModal}
            fullWidth={true}
        >
            <DialogTitle>
                <Grid container>
                    <Grid item xs={11}>
                        State Editor
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton className="closeButton" onClick={toggleStateModal}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>
            Hello World
        </Dialog>
    );
};

export default StateModal;
