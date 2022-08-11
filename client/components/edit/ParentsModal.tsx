import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useEditorContext } from "../../context/EditorContext";
import ObjectLoader from "./ObjectLoader";
import ParentList from "./parents/ParentList";
import ParentPicker from "./parents/ParentPicker";

const ParentsModal = (): React.ReactElement => {
    const {
        state: { isParentsModalOpen, objectDetailsStorage, parentsModalActivePid },
        action: { toggleParentsModal },
    } = useEditorContext();
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, parentsModalActivePid);

    const contents = (
        <>
            <h3>Add New Parent:</h3>
            <ParentPicker pid={parentsModalActivePid} />
            <h3>Parents</h3>
            {parentsModalActivePid ? <ParentList pid={parentsModalActivePid} /> : ""}
        </>
    );
    return (
        <Dialog className="parentsModal" open={isParentsModalOpen} onClose={toggleParentsModal} fullWidth={true}>
            <DialogTitle>
                <Grid container>
                    <Grid item xs={11}>
                        Parents Editor ({parentsModalActivePid})
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton className="closeButton" onClick={toggleParentsModal}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                {parentsModalActivePid ? <ObjectLoader pid={parentsModalActivePid} /> : ""}
                {loaded ? contents : ""}
            </DialogContent>
        </Dialog>
    );
};

export default ParentsModal;
