import styles from "./ObjectStatus.module.css";
import React from "react";
import { useEditorContext } from "../../context/EditorContext";
import ObjectLoader from "./ObjectLoader";

export interface ObjectStatusProps {
    pid: string;
}

export const ObjectStatus = ({ pid }: ObjectStatusProps): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
        action: { setStateModalActivePid, toggleStateModal },
    } = useEditorContext();
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, pid);
    const details = loaded ? objectDetailsStorage[pid] : {};

    const stateTxt = details.state ?? "Unknown";
    const clickAction = () => {
        setStateModalActivePid(pid);
        toggleStateModal();
    };
    const stateMsg = loaded ? (
        <button onClick={clickAction} className={styles[stateTxt.toLowerCase()]}>
            <span className={styles.indicator}>&#9673;</span>&nbsp;
            {stateTxt}
        </button>
    ) : (
        ""
    );
    return (
        <>
            <ObjectLoader pid={pid} />
            {stateMsg}
        </>
    );
};

export default ObjectStatus;
