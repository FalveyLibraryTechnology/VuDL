import React, { useEffect, useState } from "react";
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
import { getObjectStateUrl } from "../../util/routes";
import { useFetchContext } from "../../context/FetchContext";
import ObjectLoader from "./ObjectLoader";

const StateModal = (): React.ReactElement => {
    const {
        state: { isStateModalOpen, objectDetailsStorage, stateModalActivePid },
        action: { removeFromObjectDetailsStorage, setSnackbarState, toggleStateModal },
    } = useEditorContext();
    const {
        action: { fetchText },
    } = useFetchContext();
    const [isSaving, setIsSaving] = useState<bool>(false);
    const [selectedValue, setSelectedValue] = useState<string>("Inactive");
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, stateModalActivePid);
    const details = loaded ? objectDetailsStorage[stateModalActivePid] : {};
    useEffect(() => {
        setSelectedValue(details.state ?? "Inactive");
    }, [details]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedValue(event.target.value);
    };

    const showSnackbarMessage = (message: string, severity: string) => {
        setSnackbarState({
            open: true,
            message,
            severity,
        });
    };

    const save = async () => {
        if (selectedValue !== details.state) {
            const target = getObjectStateUrl(stateModalActivePid);
            setIsSaving(true);
            const result = await fetchText(target, { method: "PUT", body: selectedValue });
            if (result === "ok") {
                showSnackbarMessage("Status saved successfully.", "success");
            } else {
                showSnackbarMessage(`Status failed to save; "${result}"`, "error");
            }
            toggleStateModal();
            setIsSaving(false);
            // Clear and reload the cached object, since it has now changed!
            removeFromObjectDetailsStorage(stateModalActivePid);
        } else {
            showSnackbarMessage("No changes were made.", "info");
        }
    };

    const contents = isSaving ? (
        <p>Saving...</p>
    ) : (
        <Grid container>
            <Grid item xs={12}>
                <FormControl>
                    <FormLabel id="state-modal-group-label">State</FormLabel>
                    <RadioGroup
                        aria-labelledby="state-modal-group-label"
                        value={selectedValue}
                        name="state-modal-group"
                        onChange={handleChange}
                    >
                        <FormControlLabel value="Active" control={<Radio />} label="Active" />
                        <FormControlLabel value="Inactive" control={<Radio />} label="Inactive" />
                        <FormControlLabel value="Deleted" control={<Radio />} label="Deleted" />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid item xs={12}>
                <button onClick={save}>Save</button>
            </Grid>
        </Grid>
    );
    return (
        <Dialog className="stateModal" open={isStateModalOpen} onClose={toggleStateModal} fullWidth={true}>
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
            <DialogContent>
                {stateModalActivePid ? <ObjectLoader pid={stateModalActivePid} /> : ""}
                {contents}
            </DialogContent>
        </Dialog>
    );
};

export default StateModal;
