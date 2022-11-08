import React, { useState } from "react";
import FormControl from "@mui/material/FormControl";
import { ProcessMetadataTask } from "../../../context/ProcessMetadataContext";
import BlurSavingTextField from "../../shared/BlurSavingTextField";
import Grid from "@mui/material/Grid";
import Delete from "@mui/icons-material/Delete";
import AddCircle from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";
import { useEditorContext } from "../../../context/EditorContext";
import NativeSelect from "@mui/material/NativeSelect";

interface DatastreamProcessMetadataTaskProps {
    task: ProcessMetadataTask;
    deleteTask: () => void;
    addBelow: () => void;
    setAttributes: (attributes: Record<string, string>) => void;
}

const DatastreamProcessMetadataTask = ({
    task,
    deleteTask,
    addBelow,
    setAttributes,
}: DatastreamProcessMetadataTaskProps): React.ReactElement => {
    const {
        state: { toolPresets },
    } = useEditorContext();
    const [selectedTool, setSelectedTool] = useState(Object.keys(toolPresets)[0] ?? "");
    const applyToolPreset = () => {
        const tool = toolPresets[selectedTool] ?? {};
        setAttributes({
            toolLabel: tool.label ?? "",
            toolSerialNumber: tool.serialNumber ?? "",
            toolDescription: tool.description ?? "",
            toolMake: tool.make ?? "",
            toolVersion: tool.version ?? "",
        });
    };
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
                                    setValue={(value) => setAttributes({ sequence: value })}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth={true}>
                                <BlurSavingTextField
                                    options={{ label: "Task Label" }}
                                    value={task.label ?? ""}
                                    setValue={(value) => setAttributes({ label: value })}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth={true}>
                                <BlurSavingTextField
                                    options={{ label: "Task Description" }}
                                    value={task.description ?? ""}
                                    setValue={(value) => setAttributes({ description: value })}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth={true}>
                                <BlurSavingTextField
                                    options={{ label: "Task Individual" }}
                                    value={task.individual ?? ""}
                                    setValue={(value) => setAttributes({ individual: value })}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={7}>
                            <FormControl fullWidth={true}>
                                <label>
                                    Select a preset tool:
                                    <NativeSelect
                                        value={selectedTool}
                                        onChange={(event) => setSelectedTool(event.target.value)}
                                    >
                                        {Object.keys(toolPresets).map((index: number) => {
                                            const tool = toolPresets[index];
                                            return (
                                                <option key={`tool_preset_${index}`} value={index}>
                                                    {tool.label ?? ""}
                                                </option>
                                            );
                                        })}
                                    </NativeSelect>
                                </label>
                            </FormControl>
                        </Grid>
                        <Grid item xs={5}>
                            <button onClick={applyToolPreset}>Apply Preset</button>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth={true}>
                                <BlurSavingTextField
                                    options={{ label: "Task Tool" }}
                                    value={task.toolLabel ?? ""}
                                    setValue={(value) => setAttributes({ toolLabel: value })}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl fullWidth={true}>
                                <BlurSavingTextField
                                    options={{ label: "Tool Description" }}
                                    value={task.toolDescription ?? ""}
                                    setValue={(value) => setAttributes({ toolDescription: value })}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                            <FormControl fullWidth={true}>
                                <BlurSavingTextField
                                    options={{ label: "Tool Make" }}
                                    value={task.toolMake ?? ""}
                                    setValue={(value) => setAttributes({ toolMake: value })}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                            <FormControl fullWidth={true}>
                                <BlurSavingTextField
                                    options={{ label: "Tool Version" }}
                                    value={task.toolVersion ?? ""}
                                    setValue={(value) => setAttributes({ toolVersion: value })}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                            <FormControl fullWidth={true}>
                                <BlurSavingTextField
                                    options={{ label: "Tool Serial Number" }}
                                    value={task.toolSerialNumber ?? ""}
                                    setValue={(value) => setAttributes({ toolSerialNumber: value })}
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
