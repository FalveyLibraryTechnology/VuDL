import React from "react";
import { useEditorContext } from "../../../context/EditorContext";
import DatastreamDublinCoreEditField from "./DatastreamDublinCoreEditField";
import Grid from "@mui/material/Grid";
import crypto from "crypto";

const DatastreamDublinCoreFieldGroup = ({ field }: { field: string }): React.ReactElement => {
    const {
        state: { currentDublinCore, dublinCoreFieldCatalog },
        action: { setCurrentDublinCore },
    } = useEditorContext();
    const catalogData = dublinCoreFieldCatalog[field];
    const values = currentDublinCore[field].map((value: string, i: number) => {
        // We can't use an index as a key here, as it will cause elements to be reused
        // inappropriately. Instead we must use a hash of the content to uniquely identify
        // each input element.
        const md5 = crypto.createHash("md5").update(value).digest("hex");
        const key = `${field}_${md5}_${i}`;
        const saveChanges = (value: string) => {
            currentDublinCore[field][i] = value;
            setCurrentDublinCore(currentDublinCore);
        };
        const addAbove = () => {
            currentDublinCore[field].splice(i, 0, "");
            setCurrentDublinCore(currentDublinCore);
        };
        const deleteRow = () => {
            currentDublinCore[field].splice(i, 1);
            setCurrentDublinCore(currentDublinCore);
        };
        const locked = catalogData.type === "locked";
        const buttons = locked ? null : (
            <>
                <button onClick={addAbove}>Add Above</button>
                <button onClick={deleteRow}>Delete</button>
            </>
        );
        return (
            <Grid container spacing={1} key={key}>
                <Grid item xs={10}>
                    <DatastreamDublinCoreEditField value={value} setValue={saveChanges} fieldType={catalogData.type} />
                </Grid>
                <Grid item xs={2}>
                    {buttons}
                </Grid>
            </Grid>
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
