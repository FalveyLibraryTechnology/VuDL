import React from "react";
import { useEditorContext } from "../../../context/EditorContext";
import FormControl from "@mui/material/FormControl";
import BlurSavingTextField from "../../shared/BlurSavingTextField";
import TextField from "@mui/material/TextField";

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
        switch (catalogData.type) {
            case "locked":
                return (
                    <FormControl fullWidth={true} key={key}>
                        <TextField type="text" value={value} disabled={true} />
                    </FormControl>
                );
            case "text":
                return (
                    <FormControl fullWidth={true} key={key}>
                        <BlurSavingTextField value={value} setValue={saveChanges} />
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
