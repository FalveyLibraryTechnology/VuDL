import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
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
import CircularProgress from "@mui/material/CircularProgress";

const StateModal = (): React.ReactElement => {
    const {
        state: { isStateModalOpen, objectDetailsStorage, stateModalActivePid },
        action: { loadObjectDetailsIntoStorage, toggleStateModal },
    } = useEditorContext();
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, stateModalActivePid);
    const details = loaded ? objectDetailsStorage[stateModalActivePid] : {};
    let selectedValue = loaded ? details.state : "Inactive";
    useEffect(() => {
        if (!loaded) {
            loadObjectDetailsIntoStorage(stateModalActivePid);
        }
    }, []);
    const loadingMessage = !loaded ? (
        <>
            &nbsp;
            <CircularProgress size="1em" />
        </>
    ) : (
        ""
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        selectedValue = event.target.value;
    };

    const save = () => {
        if (selectedValue !== details.state) {
            alert("save!");
        }
        toggleStateModal();
    };

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
                        State Editor ({stateModalActivePid})
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton className="closeButton" onClick={toggleStateModal}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>
            {loadingMessage}
            <FormControl>
                <FormLabel id="state-modal-group-label">State</FormLabel>
                <RadioGroup
                    aria-labelledby="state-modal-group-label"
                    defaultValue={details.state ?? "Inactive"}
                    name="state-modal-group"
                    onChange={handleChange}
                >
                    <FormControlLabel value="Active" control={<Radio />} label="Active" />
                    <FormControlLabel value="Inactive" control={<Radio />} label="Inactive" />
                    <FormControlLabel value="Deleted" control={<Radio />} label="Deleted" />
                </RadioGroup>
            </FormControl>
            <button onClick={save}>Save</button>
        </Dialog>
    );
};

export default StateModal;
