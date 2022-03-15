import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip } from "@mui/material";
import { UploadFile, Delete } from "@mui/icons-material";
import { useEditorContext } from "../../../context/EditorContext";

const Icons = {
    Upload: <UploadFile />,
    // VIEW: ,
    // METADATA: ,
    // DOWNLOAD: ,
    Delete: <Delete />,
};

const DatastreamControlButton = ({ modalState, datastream, disabled }) => {
    const {
        action: { toggleDatastreamModal, setActiveDatastream, setDatastreamModalState },
    } = useEditorContext();

    const onClick = () => {
        setActiveDatastream(datastream);
        setDatastreamModalState(modalState);
        toggleDatastreamModal();
    };

    return (
        <Tooltip title={modalState}>
            <IconButton
                aria-label={modalState}
                disabled={modalState !== "Upload" && disabled}
                onClick={onClick}
                size="small"
            >
                {Icons[modalState]}
            </IconButton>
        </Tooltip>
    );
};

DatastreamControlButton.propTypes = {
    modalState: PropTypes.string,
    disabled: PropTypes.bool,
    datastream: PropTypes.string,
};
export default DatastreamControlButton;
