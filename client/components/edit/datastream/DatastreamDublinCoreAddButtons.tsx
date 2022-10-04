import React, { useState } from "react";
import { useEditorContext } from "../../../context/EditorContext";
import PidPicker from "../PidPicker";

const DatastreamDublinCoreAddButtons = (): React.ReactElement => {
    const {
        state: { currentDublinCore, dublinCoreFieldCatalog, objectDetailsStorage },
        action: { loadObjectDetailsIntoStorage, setCurrentDublinCore },
    } = useEditorContext();
    const [clonePid, setClonePid] = useState("");
    const clonePidLoaded = clonePid.length > 0 && Object.prototype.hasOwnProperty.call(objectDetailsStorage, clonePid);
    const loadClonePid = async (newClonePid: string) => {
        if (newClonePid.length == 0) {
            setClonePid("");
            return;
        }
        if (!Object.prototype.hasOwnProperty.call(objectDetailsStorage, newClonePid)) {
            let error = false;
            const errorCallback = () => {
                error = true;
            };
            await loadObjectDetailsIntoStorage(newClonePid, errorCallback);
            if (error) {
                alert(`Cannot load PID: ${newClonePid}`);
                return;
            }
        }
        setClonePid(newClonePid);
    };
    const addField = (field: string) => {
        if (!Object.prototype.hasOwnProperty.call(currentDublinCore, field)) {
            currentDublinCore[field] = [];
        }
        currentDublinCore[field].push("");
        setCurrentDublinCore(currentDublinCore);
    };
    const buttons = [];
    for (const key in dublinCoreFieldCatalog) {
        const current = dublinCoreFieldCatalog[key];
        // Don't add fields we're not allowed to edit:
        if (current.type !== "locked") {
            buttons.push(
                <button key={"dcadd_" + key.replace(":", "_")} onClick={() => addField(key)}>
                    {current.label}
                </button>
            );
        }
    }
    const doClone = async () => {
        const details = objectDetailsStorage[clonePid] ?? {};
        const metadata = details.metadata ?? {};
        for (const field in metadata) {
            // Don't clone locked fields!
            if (dublinCoreFieldCatalog[field].type !== "locked") {
                currentDublinCore[field] = (currentDublinCore[field] ?? []).concat(metadata[field]);
            }
        }
        setCurrentDublinCore(currentDublinCore);
        setClonePid("");
    };
    return (
        <>
            <h3>Add Blank Field:</h3>
            {buttons}
            <h3>Clone Metadata:</h3>
            <PidPicker selected={clonePid} setSelected={loadClonePid} />
            {clonePidLoaded ? <button onClick={doClone}>Clone</button> : null}
        </>
    );
};

export default DatastreamDublinCoreAddButtons;
