import React from "react";
import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import { DatastreamModalStates } from "../../../context/EditorContext";
import DatastreamControlButton from "./DatastreamControlButton";

interface DatastreamControlsProps {
    datastream: string;
    disabled: boolean;
}

const DatastreamControls = ({ datastream, disabled }: DatastreamControlsProps): React.ReactElement => {
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

export default DatastreamControls;
