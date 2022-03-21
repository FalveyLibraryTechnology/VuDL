import React from "react";
import { Button, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import { useEditorContext } from "../../../context/EditorContext";
import { useFetchContext } from "../../../context/FetchContext";
import { deleteObjectDatastreamUrl } from "../../../util/routes";

const DatastreamDeleteModalContent = () => {
    const {
        action: { fetchText },
    } = useFetchContext();
    const {
        state: { currentPid, activeDatastream },
        action: { setSnackbarState, toggleDatastreamModal, getCurrentModelsDatastreams },
    } = useEditorContext();
    const deleteDatastream = async () => {
        try {
            const text = await fetchText(deleteObjectDatastreamUrl(currentPid, activeDatastream), {
                method: "DELETE",
            });
            await getCurrentModelsDatastreams();
            setSnackbarState({
                open: true,
                message: text,
                severity: "success",
            });
        } catch (err) {
            setSnackbarState({
                open: true,
                message: err.message,
                severity: "error",
            });
        }
        toggleDatastreamModal();
    };
    return (
        <>
            <DialogContent>
                <DialogContentText>Are you sure you want to delete the datastream?</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button className="noButton" onClick={toggleDatastreamModal}>
                    No
                </Button>
                <Button className="yesButton" onClick={deleteDatastream}>
                    Yes
                </Button>
            </DialogActions>
        </>
    );
};

export default DatastreamDeleteModalContent;
