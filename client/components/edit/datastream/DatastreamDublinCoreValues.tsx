import React from "react";
import { useEditorContext } from "../../../context/EditorContext";

const DatastreamDublinCoreValues = (): React.ReactElement => {
    const {
        state: { currentDublinCore },
    } = useEditorContext();
    return <>{JSON.stringify(currentDublinCore)}</>;
};

export default DatastreamDublinCoreValues;
