import React from "react";
import { useEditorContext } from "../../../context/EditorContext";
import DatastreamDublinCoreEditField from "./DatastreamDublinCoreEditField";
import Delete from "@mui/icons-material/Delete";
import AddCircle from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";

// We need to be careful about how we set keys for elements in our control group; if we reuse
// keys after changing components, then when we add or remove values in the list, React may
// inappropriately reuse existing elements instead of correctly redrawing the modified list.
// By maintaining a counter of the number of times impactful changes are made in the list, we
// can ensure that keys are always unique, and that elements are redrawn when necessary.
// This feels like a hack, and a better solution would be welcomed!
const keyCounter: Record<string, number> = {};

const DatastreamDublinCoreFieldGroup = ({ field }: { field: string }): React.ReactElement => {
    const {
        state: { currentDublinCore, dublinCoreFieldCatalog },
        action: { setCurrentDublinCore },
    } = useEditorContext();
    const catalogData = dublinCoreFieldCatalog[field];
    const values = currentDublinCore[field].map((value: string, i: number) => {
        if (!Object.prototype.hasOwnProperty.call(keyCounter, field)) {
            keyCounter[field] = 0;
        }
        const key = `${field}_${i}_${keyCounter[field]}`;
        const saveChanges = (value: string) => {
            currentDublinCore[field][i] = value;
            setCurrentDublinCore(currentDublinCore);
        };
        const addAbove = () => {
            currentDublinCore[field].splice(i, 0, "");
            keyCounter[field]++;
            setCurrentDublinCore(currentDublinCore);
        };
        const deleteRow = () => {
            currentDublinCore[field].splice(i, 1);
            keyCounter[field]++;
            setCurrentDublinCore(currentDublinCore);
        };
        const locked = catalogData.type === "locked";
        const buttons = locked ? null : (
            <>
                <IconButton onClick={addAbove}>
                    <AddCircle titleAccess="Add Above" />
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
