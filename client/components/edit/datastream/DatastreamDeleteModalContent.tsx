import React from "react";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
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
