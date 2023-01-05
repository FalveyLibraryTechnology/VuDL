import React from "react";
import { useEditorContext } from "../../../context/EditorContext";
import { useDublinCoreMetadataContext } from "../../../context/DublinCoreMetadataContext";
import DatastreamDublinCoreFieldGroup from "./DatastreamDublinCoreFieldGroup";

const DatastreamDublinCoreValues = (): React.ReactElement => {
    const {
        state: { dublinCoreFieldCatalog },
    } = useEditorContext();
    const {
        state: { currentDublinCore },
    } = useDublinCoreMetadataContext();
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
