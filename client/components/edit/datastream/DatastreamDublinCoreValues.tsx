import React from "react";
import { useEditorContext } from "../../../context/EditorContext";

interface DatastreamDublinCoreValuesProps {
    metadata: Record<string, Array<string>>;
}
const DatastreamDublinCoreValues = ({
    metadata,
}: DatastreamDublinCoreValuesProps): React.ReactElement => {
    const {
        state: { currentDublinCore },
    } = useEditorContext();
    return <>{JSON.stringify(currentDublinCore)}</>;
}

export default DatastreamDublinCoreValues;