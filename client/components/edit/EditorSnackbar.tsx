import React from "react";
import { Snackbar, Alert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEditorContext } from "../../context/EditorContext";

const EditorSnackbar = () => {
    const {
        state: {
            snackbarState: { message, open, severity },
        },
        action: { setSnackbarState },
    } = useEditorContext();

    const handleClose = () => {
        setSnackbarState({
            open: false,
            message: "",
            severity: "info",
        });
    };

    return (
        <Snackbar className="editorSnackbar" open={open} autoHideDuration={5000} onClose={handleClose}>
            <Alert
                className="editorSnackbarAlert"
                severity={severity}
                action={
                    <IconButton
                        className="editorSnackBarAlertCloseButton"
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={handleClose}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default EditorSnackbar;
