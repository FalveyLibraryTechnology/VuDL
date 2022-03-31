import React from "react";
import { Button, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import { useEditorContext } from "../../../context/EditorContext";
import useDatastreamOperation from "../../../hooks/useDatastreamOperation";

const DatastreamDeleteModalContent = () => {
    const {
        action: { toggleDatastreamModal },
    } = useEditorContext();
    const { deleteDatastream } = useDatastreamOperation();

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
