import React, { useState } from "react";
import PropTypes from "prop-types";
import LoadingButton from "@mui/lab/LoadingButton";
import Tooltip from "@mui/material/Tooltip";
import Download from "@mui/icons-material/Download";
import Delete from "@mui/icons-material/Delete";
import UploadFile from "@mui/icons-material/UploadFile";
import { useEditorContext } from "../../../context/EditorContext";
import useDatastreamOperation from "../../../hooks/useDatastreamOperation";

const Icons = {
    Upload: <UploadFile />,
    // VIEW: ,
    // METADATA: ,
    Download: <Download />,
    Delete: <Delete />,
};

const DatastreamControlButton = ({ modalState, datastream, disabled }) => {
    const [isLoading, setLoading] = useState(false);
    const {
        action: { toggleDatastreamModal, setActiveDatastream, setDatastreamModalState },
    } = useEditorContext();
    const { downloadDatastream } = useDatastreamOperation();
    const onClick = (modalState) => {
        if (modalState !== "Download") {
            return () => {
                setActiveDatastream(datastream);
                setDatastreamModalState(modalState);
                toggleDatastreamModal();
            };
        }
        return async () => {
            setLoading(true);
            await downloadDatastream(datastream);
            setLoading(false);
        };
    };

    return (
        <Tooltip title={modalState}>
            <LoadingButton
                className="datastreamControlButton"
                loading={isLoading}
                aria-label={modalState}
                disabled={modalState !== "Upload" && disabled}
                onClick={onClick(modalState)}
                size="small"
            >
                {Icons[modalState]}
            </LoadingButton>
        </Tooltip>
    );
};

DatastreamControlButton.propTypes = {
    modalState: PropTypes.string,
    disabled: PropTypes.bool,
    datastream: PropTypes.string,
};
export default DatastreamControlButton;
