import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import PropTypes from "prop-types";
import React from "react";
import DatastreamControls from "./DatastreamControls";

const Datastream = ({ datastream }) => {
    const { stream, disabled } = datastream;
    return (
        <ListItem secondaryAction={<DatastreamControls datastream={stream} disabled={disabled} />}>
            <ListItemText primary={stream} />
        </ListItem>
    );
};

Datastream.propTypes = {
    datastream: PropTypes.object,
};

export default Datastream;
