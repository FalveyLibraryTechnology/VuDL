import React from "react";
import FormControl from "@mui/material/FormControl";
import { ProcessMetadataTask } from "../../../context/ProcessMetadataContext";
import BlurSavingTextField from "../../shared/BlurSavingTextField";
import Grid from "@mui/material/Grid";
import Delete from "@mui/icons-material/Delete";
import AddCircle from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";

interface DatastreamProcessMetadataTaskProps {
    task: ProcessMetadataTask;
    deleteTask: () => void;
    addBelow: () => void;
    setAttribute: (attribute: string, value: string) => void;
}

const DatastreamProcessMetadataTask = ({
    task,
    deleteTask,
    addBelow,
    setAttribute,
}: DatastreamProcessMetadataTaskProps): React.ReactElement => {
    return (
        <>
            <hr style={{ marginBottom: "20px" }} />
            <Grid container spacing={1}>
                <Grid item xs={11}>
                    <Grid container spacing={1} style={{ marginBottom: "10px" }}>
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
                </Grid>
                <Grid item xs={1}>
                    <IconButton onClick={addBelow}>
                        <AddCircle titleAccess="Add Below" />
                    </IconButton>
                    <IconButton onClick={deleteTask}>
                        <Delete titleAccess="Delete Task" />
                    </IconButton>
                </Grid>
            </Grid>
        </>
    );
};

export default DatastreamProcessMetadataTask;
