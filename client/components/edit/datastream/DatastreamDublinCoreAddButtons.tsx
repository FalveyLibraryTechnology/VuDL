import React from "react";
import { useEditorContext } from "../../../context/EditorContext";

const DatastreamDublinCoreAddButtons = (): React.ReactElement => {
    const {
        state: { currentDublinCore, dublinCoreFieldCatalog },
        action: { setCurrentDublinCore },
    } = useEditorContext();
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
    return (
        <>
            <h3>Add Field:</h3>
            {buttons}
            <h3>Other Tools:</h3>
            <button onClick={() => alert("TODO")}>Clone Metadata</button>
        </>
    );
};

export default DatastreamDublinCoreAddButtons;
