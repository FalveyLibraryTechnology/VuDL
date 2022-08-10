import React, { useState } from "react";
import ObjectLoader from "../ObjectLoader";
import PidPicker from "../PidPicker";
import { useEditorContext } from "../../../context/EditorContext";

const ParentPicker = (): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
        action: { setSnackbarState },
    } = useEditorContext();
    const [selectedPid, setSelectedPid] = useState<string>("");
    const [position, setPosition] = useState<string>("");

    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, selectedPid);
    const details = loaded ? objectDetailsStorage[selectedPid] : null;

    const showSnackbarMessage = (message: string, severity: string) => {
        setSnackbarState({
            open: true,
            message,
            severity,
        });
    };

    const errorCallback = (pid: string) => {
        showSnackbarMessage(`Cannot load details for ${pid}. Are you sure this is a valid PID?`, "error");
        setSelectedPid("");
    };

    const positionRequired = details && (details.sortOn ?? "") == "custom";
    const positionControl = positionRequired
        ? <label>Position: <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} /></label>
        : null;

    let error = "";
    if (positionRequired && position.length == 0) {
        error = "Please enter a position.";
    } else if (!details) {
        error = "Please select a valid PID.";
    }
    return (
        <>
            {selectedPid.length > 0 ? <ObjectLoader pid={selectedPid} errorCallback={errorCallback} /> : null}
            <PidPicker selected={selectedPid} setSelected={setSelectedPid} />
            <br />
            {positionControl}
            {error.length == 0 ? <button>Add</button> : error}
        </>
    );
};

export default ParentPicker;
