import React from "react";
import { useEditorContext } from "../../../context/EditorContext";
import DatastreamDublinCoreEditField from "./DatastreamDublinCoreEditField";

const DatastreamDublinCoreFieldGroup = ({ field }: { field: string }): React.ReactElement => {
    const {
        state: { currentDublinCore, dublinCoreFieldCatalog },
        action: { setCurrentDublinCore },
    } = useEditorContext();
    const catalogData = dublinCoreFieldCatalog[field];
    const values = currentDublinCore[field].map((value: string, i: number) => {
        const key = `${field}_value_${i}`;
        const saveChanges = (value: string) => {
            currentDublinCore[field][i] = value;
            setCurrentDublinCore(currentDublinCore);
        };
        return (
            <div key={key}>
                <DatastreamDublinCoreEditField value={value} setValue={saveChanges} fieldType={catalogData.type} />
            </div>
        );
    });

    return (
        <>
            <h3>{catalogData.label}</h3>
            {values}
        </>
    );
};

export default DatastreamDublinCoreFieldGroup;
