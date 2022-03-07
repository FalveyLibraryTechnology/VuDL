import React from "react";
import PropTypes from "prop-types";
import { Box, ButtonGroup } from "@mui/material";
import { DatastreamModalStates } from "../../../context/EditorContext";
import DatastreamControlButton from "./DatastreamControlButton";

const DatastreamControls = ({ datastream }) => {
    return (
        <Box className="datastreamControls">
            <ButtonGroup variant="text">
                {Object.values(DatastreamModalStates).map((modalState, index) => {
                    return <DatastreamControlButton modalState={modalState} datastream={datastream} key={index} />;
                })}
            </ButtonGroup>
        </Box>
    );
};
DatastreamControls.propTypes = {
    datastream: PropTypes.string,
};
export default DatastreamControls;
