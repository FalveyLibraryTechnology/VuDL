import React from "react";
import { useEditorContext } from "../../../context/EditorContext";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";

const DatastreamDublinCoreFieldGroup = ({ field }: { field: string }): React.ReactElement => {
    const {
        state: { currentDublinCore, dublinCoreFieldCatalog },
        action: { setCurrentDublinCore },
    } = useEditorContext();
    const catalogData = dublinCoreFieldCatalog[field];
    const values = currentDublinCore[field].map((value: string, i: number) => {
        const key = `${field}_value_${i}`;
        const handleChangeEvent = (event: React.ChangeEvent) => {
            currentDublinCore[field][i] = event.target.value;
            setCurrentDublinCore(currentDublinCore);
        };
        switch (catalogData.type) {
            case "text":
                return (
                    <FormControl fullWidth={true} key={key}>
                        <TextField type="text" value={value} onChange={handleChangeEvent} />
                    </FormControl>
                );
            default:
                return <p key={key}>{`Unsupported type (${catalogData.type}): ${value}`}</p>;
        }
    });

    return (
        <>
            <h3>{catalogData.label}</h3>
            {values}
        </>
    );
};

export default DatastreamDublinCoreFieldGroup;
