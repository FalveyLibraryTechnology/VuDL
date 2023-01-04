import React from "react";
import { useEditorContext } from "../../../context/EditorContext";
import { useDublinCoreMetadataContext } from "../../../context/DublinCoreMetadataContext";
import DatastreamDublinCoreEditField from "./DatastreamDublinCoreEditField";
import Delete from "@mui/icons-material/Delete";
import AddCircle from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";

const DatastreamDublinCoreFieldGroup = ({ field }: { field: string }): React.ReactElement => {
    const {
        state: { dublinCoreFieldCatalog },
    } = useEditorContext();
    const catalogData = dublinCoreFieldCatalog[field];
    const {
        state: { currentDublinCore, keyCounter },
        action: { addValueBelow, deleteValue, replaceValue },
    } = useDublinCoreMetadataContext();
    const values = currentDublinCore[field].map((value: string, i: number) => {
        if (!Object.prototype.hasOwnProperty.call(keyCounter, field)) {
            keyCounter[field] = 0;
        }
        const key = `${field}_${i}_${keyCounter[field] ?? 0}`;
        const saveChanges = (value: string) => {
            replaceValue(field, i, value);
        };
        const addBelow = () => {
            addValueBelow(field, i, "");
        };
        const deleteRow = () => {
            deleteValue(field, i);
        };
        const locked = catalogData.type === "locked";
        const buttons = locked ? null : (
            <>
                <IconButton onClick={addBelow}>
                    <AddCircle titleAccess="Add Below" />
                </IconButton>
                <IconButton onClick={deleteRow}>
                    <Delete titleAccess="Delete Row" />
                </IconButton>
            </>
        );
        return (
            <Grid container spacing={1} key={key}>
                <Grid item xs={10}>
                    <DatastreamDublinCoreEditField
                        value={value}
                        setValue={saveChanges}
                        fieldType={catalogData.type}
                        legalValues={catalogData.values ?? []}
                    />
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
