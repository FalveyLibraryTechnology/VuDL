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
        buttons.push(<button onClick={() => addField(key)}>{current.label}</button>);
    }
    return <>{buttons}</>;
};

export default DatastreamDublinCoreAddButtons;
