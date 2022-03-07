import React from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import { useEditorContext } from "../../../context/EditorContext";

const DatastreamControlButton = ({ modalState, datastream }) => {
    const {
        action: { toggleDatastreamModal, setActiveDatastream, setDatastreamModalState },
    } = useEditorContext();

    const onClick = () => {
        setActiveDatastream(datastream);
        setDatastreamModalState(modalState);
        toggleDatastreamModal();
    };

    return (
        <Button onClick={onClick} variant="outlined" size="small">
            {modalState}
        </Button>
    );
};

DatastreamControlButton.propTypes = {
    modalState: PropTypes.string,
    datastream: PropTypes.string,
};
export default DatastreamControlButton;
