import styles from "./Datastream.module.css";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import React from "react";
import DatastreamControls from "./DatastreamControls";

interface DatastreamProps {
    datastream: {
        stream: string;
        disabled: boolean;
    };
}
const Datastream = ({ datastream }: DatastreamProps): React.ReactElement => {
    const { stream, disabled } = datastream;
    return (
        <ListItem
            classes={disabled ? {} : { root: styles.enabled }}
            secondaryAction={<DatastreamControls datastream={stream} disabled={disabled} />}
        >
            <ListItemText primary={stream} />
        </ListItem>
    );
};

export default Datastream;
