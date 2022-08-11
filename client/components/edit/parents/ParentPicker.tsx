import React, { useState } from "react";
import ObjectLoader from "../ObjectLoader";
import PidPicker from "../PidPicker";
import { useEditorContext } from "../../../context/EditorContext";
import { useFetchContext } from "../../../context/FetchContext";
import { getParentUrl } from "../../../util/routes";

interface ParentPickerProps {
    pid: string;
}

const ParentPicker = ({ pid }: ParentPickerProps): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
        action: {
            clearPidFromChildListStorage,
            removeFromObjectDetailsStorage,
            removeFromParentDetailsStorage,
            setSnackbarState,
        },
    } = useEditorContext();
    const {
        action: { fetchText },
    } = useFetchContext();
    const [selectedParentPid, setSelectedParentPid] = useState<string>("");
    const [position, setPosition] = useState<string>("");
    const [statusMessage, setStatusMessage] = useState<string>("");

    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, selectedParentPid);
    const details = loaded ? objectDetailsStorage[selectedParentPid] : null;

    const showSnackbarMessage = (message: string, severity: string) => {
        setSnackbarState({
            open: true,
            message,
            severity,
        });
    };

    const errorCallback = (pid: string) => {
        showSnackbarMessage(`Cannot load details for ${pid}. Are you sure this is a valid PID?`, "error");
        setSelectedParentPid("");
    };

    const addParent = async () => {
        setStatusMessage("Saving...");
        const target = getParentUrl(pid, selectedParentPid);
        const result = await fetchText(target, { method: "PUT", body: position });
        if (result === "ok") {
            // Clear and reload the cached object and its parents, since these have now changed!
            removeFromObjectDetailsStorage(pid);
            removeFromParentDetailsStorage(pid);
            // Clear any cached lists belonging to the parent PID, because the
            // order has potentially changed!
            clearPidFromChildListStorage(selectedParentPid);
            showSnackbarMessage(`Successfully added ${pid} to ${selectedParentPid}`, "info");
        } else {
            showSnackbarMessage(result, "error");
        }
        setStatusMessage("");
    };

    const positionRequired = details && (details.sortOn ?? "") == "custom";
    const positionControl = positionRequired ? (
        <label>
            Position: <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} />
        </label>
    ) : null;

    let error = "";
    if (positionRequired && position.length == 0) {
        error = "Please enter a position.";
    } else if (!details) {
        error = "Please select a valid PID.";
    }
    if (error != statusMessage) {
        setStatusMessage(error);
    }
    return (
        <>
            {selectedParentPid.length > 0 ? (
                <ObjectLoader pid={selectedParentPid} errorCallback={errorCallback} />
            ) : null}
            <PidPicker selected={selectedParentPid} setSelected={setSelectedParentPid} />
            <br />
            {positionControl}
            {statusMessage.length == 0 ? <button onClick={addParent}>Add</button> : statusMessage}
        </>
    );
};

export default ParentPicker;
