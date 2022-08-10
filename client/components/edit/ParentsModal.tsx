import React, { useEffect, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useEditorContext } from "../../context/EditorContext";
import { getObjectRecursiveChildPidsUrl, getObjectStateUrl } from "../../util/routes";
import { useFetchContext } from "../../context/FetchContext";
import ObjectLoader from "./ObjectLoader";

const ParentsModal = (): React.ReactElement => {
    const {
        state: { isParentsModalOpen, objectDetailsStorage, parentsModalActivePid },
        action: { removeFromObjectDetailsStorage, setSnackbarState, toggleParentsModal },
    } = useEditorContext();
    const {
        action: { fetchJSON, fetchText },
    } = useFetchContext();
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [includeChildren, setIncludeChildren] = useState<boolean>(false);
    const [selectedValue, setSelectedValue] = useState<string>("Inactive");
    const [childPidResponse, setChildPidResponse] = useState({ loading: true });
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, parentsModalActivePid);
    const details = loaded ? objectDetailsStorage[parentsModalActivePid] : {};

    const showSnackbarMessage = (message: string, severity: string) => {
        setSnackbarState({
            open: true,
            message,
            severity,
        });
    };

    const contents = "Coming soon...";

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
                {contents}
            </DialogContent>
        </Dialog>
    );
};

export default ParentsModal;
