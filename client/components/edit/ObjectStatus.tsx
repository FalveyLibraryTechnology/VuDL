import styles from "./ObjectStatus.module.css";
import React, { useEffect, useState } from "react";
import { useEditorContext } from "../../context/EditorContext";
import CircularProgress from "@mui/material/CircularProgress";

export interface ObjectStatusProps {
    pid: string;
}

export const ObjectStatus = ({ pid }: ObjectStatusProps): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
        action: { loadObjectDetailsIntoStorage },
    } = useEditorContext();
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, pid);
    const details = loaded ? objectDetailsStorage[pid] : {};

    useEffect(() => {
        if (!loaded) {
            loadObjectDetailsIntoStorage(pid);
        }
    }, []);
    const loadingMessage = !loaded ? (
        <>
            &nbsp;
            <CircularProgress size="1em" />
        </>
    ) : (
        ""
    );
    const stateTxt = details.state ?? "Unknown";
    const stateMsg = loaded
        ? <span className={styles[stateTxt.toLowerCase()]}><span className={styles.indicator}>&#9673;</span>&nbsp;
            {stateTxt}
        </span>
        : "";
    return (
        <>
            {loadingMessage}
            {stateMsg}
        </>
    );
};

export default ObjectStatus;
