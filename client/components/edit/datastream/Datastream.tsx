import { ListItem, ListItemText } from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import DatastreamControls from "./DatastreamControls";

const Datastream = ({ datastream }) => {
    const { stream, disabled } = datastream;
    return (
        <ListItem disabled={disabled} secondaryAction={<DatastreamControls datastream={stream} />}>
            <ListItemText primary={stream} />
        </ListItem>
    );
};

Datastream.propTypes = {
    datastream: PropTypes.object,
};

export default Datastream;
