import React, { useState } from "react";
import ObjectLoader from "../ObjectLoader";
import PidPicker from "../PidPicker";
import { useEditorContext } from "../../../context/EditorContext";

const ParentPicker = (): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
        //action: { loadObjectDetailsIntoStorage },
    } = useEditorContext();
    const [selectedPid, setSelectedPid] = useState<string>("");
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, selectedPid);
    const details = loaded ? objectDetailsStorage[selectedPid] : null;
    console.log(loaded, details);
    return (
        <>
            {selectedPid.length > 0 ? <ObjectLoader pid={selectedPid} /> : null}
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
