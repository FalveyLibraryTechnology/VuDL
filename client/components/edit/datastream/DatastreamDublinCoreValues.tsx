import React from "react";
import { useEditorContext } from "../../../context/EditorContext";
import DatastreamDublinCoreFieldGroup from "./DatastreamDublinCoreFieldGroup";

const DatastreamDublinCoreValues = (): React.ReactElement => {
    const {
        state: { currentDublinCore, dublinCoreFieldCatalog },
    } = useEditorContext();
    // Display fields in the order defined by the catalog:
    const sections = [];
    for (const field in dublinCoreFieldCatalog) {
        if ((currentDublinCore[field] ?? []).length > 0) {
            sections.push(<DatastreamDublinCoreFieldGroup field={field} key={"dcgroup_" + field} />);
        }
    }
    return <>{sections}</>;
};

export default DatastreamDublinCoreValues;
