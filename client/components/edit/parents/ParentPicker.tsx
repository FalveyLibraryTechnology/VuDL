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

    return (
        <>
            {selectedPid.length > 0 ? <ObjectLoader pid={selectedPid} errorCallback={errorCallback} /> : null}
            <PidPicker selected={selectedPid} setSelected={setSelectedPid} />
            <br />
            <label>
                Position:{" "}
                {details ? (
                    details.sortOn == "custom" ? (
                        <input type="text"></input>
                    ) : (
                        `Sorted by ${details.sortOn}`
                    )
                ) : (
                    "Waiting for PID selection..."
                )}
            </label>
            {details ? <button>Add</button> : "Please select a valid PID."}
        </>
    );
};

export default ParentPicker;
