import React from "react";

interface DatastreamDublinCoreValuesProps {
    metadata: Record<string, Array<string>>;
}
const DatastreamDublinCoreValues = ({
    metadata,
}: DatastreamDublinCoreValuesProps): React.ReactElement => {
    return <>{JSON.stringify(metadata)}</>;
}

export default DatastreamDublinCoreValues;