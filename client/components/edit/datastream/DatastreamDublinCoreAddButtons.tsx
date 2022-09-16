import React from "react";

interface DatastreamDublinCoreAddButtonsProps {
    metadata: Record<string, Array<string>>;
    setMetadata: (metadata: Record<string, Array<string>>) => void;
    fieldCatalog: Record<string, Record<string, string>>;
}
const DatastreamDublinCoreAddButtons = ({
    metadata,
    setMetadata,
    fieldCatalog
}: DatastreamDublinCoreAddButtonsProps): React.ReactElement => {
    return <>{"buttons!"}</>;
}

export default DatastreamDublinCoreAddButtons;