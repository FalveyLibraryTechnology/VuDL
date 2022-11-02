import React from "react";
import FormControl from "@mui/material/FormControl";
import { ProcessMetadataTask } from "../../../context/ProcessMetadataContext";
import BlurSavingTextField from "../../shared/BlurSavingTextField";
import Grid from "@mui/material/Grid";

interface DatastreamProcessMetadataTaskProps {
    task: ProcessMetadataTask;
    setAttribute: (attribute: string, value: string) => void;
}

const DatastreamProcessMetadataTask = ({
    task,
    setAttribute,
}: DatastreamProcessMetadataTaskProps): React.ReactElement => {
    return (
        <Grid container spacing={1} style={{ "margin-bottom": "10px" }}>
            <Grid item xs={3}>
                <FormControl fullWidth={true}>
                    <BlurSavingTextField
                        options={{ label: "Task Sequence" }}
                        value={task.sequence ?? ""}
                        setValue={(value) => setAttribute("sequence", value)}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={3}>
                <FormControl fullWidth={true}>
                    <BlurSavingTextField
                        options={{ label: "Task Label" }}
                        value={task.label ?? ""}
                        setValue={(value) => setAttribute("label", value)}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={3}>
                <FormControl fullWidth={true}>
                    <BlurSavingTextField
                        options={{ label: "Task Description" }}
                        value={task.description ?? ""}
                        setValue={(value) => setAttribute("description", value)}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={3}>
                <FormControl fullWidth={true}>
                    <BlurSavingTextField
                        options={{ label: "Task Individual" }}
                        value={task.individual ?? ""}
                        setValue={(value) => setAttribute("individual", value)}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={3}>
                <FormControl fullWidth={true}>
                    <BlurSavingTextField
                        options={{ label: "Task Tool" }}
                        value={task.toolLabel ?? ""}
                        setValue={(value) => setAttribute("toolLabel", value)}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={3}>
                <FormControl fullWidth={true}>
                    <BlurSavingTextField
                        options={{ label: "Tool Description" }}
                        value={task.toolDescription ?? ""}
                        setValue={(value) => setAttribute("toolDescription", value)}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={2}>
                <FormControl fullWidth={true}>
                    <BlurSavingTextField
                        options={{ label: "Tool Make" }}
                        value={task.toolMake ?? ""}
                        setValue={(value) => setAttribute("toolMake", value)}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={2}>
                <FormControl fullWidth={true}>
                    <BlurSavingTextField
                        options={{ label: "Tool Version" }}
                        value={task.toolVersion ?? ""}
                        setValue={(value) => setAttribute("toolVersion", value)}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={2}>
                <FormControl fullWidth={true}>
                    <BlurSavingTextField
                        options={{ label: "Tool Serial Number" }}
                        value={task.toolSerialNumber ?? ""}
                        setValue={(value) => setAttribute("toolSerialNumber", value)}
                    />
                </FormControl>
            </Grid>
        </Grid>
    );
};

export default DatastreamProcessMetadataTask;
