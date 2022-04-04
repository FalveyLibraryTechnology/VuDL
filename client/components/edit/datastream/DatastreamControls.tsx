import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import { DatastreamModalStates } from "../../../context/EditorContext";
import DatastreamControlButton from "./DatastreamControlButton";

const DatastreamControls = ({ datastream, disabled }) => {
    return (
        <Box className="datastreamControls">
            <ButtonGroup variant="text">
                {Object.values(DatastreamModalStates).map((modalState, index) => {
                    return (
                        <DatastreamControlButton
                            modalState={modalState}
                            disabled={disabled}
                            datastream={datastream}
                            key={index}
                        />
                    );
                })}
            </ButtonGroup>
        </Box>
    );
};
DatastreamControls.propTypes = {
    datastream: PropTypes.string,
    disabled: PropTypes.bool,
};
export default DatastreamControls;
