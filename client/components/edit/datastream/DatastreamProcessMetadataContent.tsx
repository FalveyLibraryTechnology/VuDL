import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import useDatastreamOperation from "../../../hooks/useDatastreamOperation";
import { useEditorContext } from "../../../context/EditorContext";
import { useProcessMetadataContext } from "../../../context/ProcessMetadataContext";
import BlurSavingTextField from "../../shared/BlurSavingTextField";
import Grid from "@mui/material/Grid";
import DatastreamProcessMetadataTask from "./DatastreamProcessMetadataTask";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type {} from "@mui/x-date-pickers/themeAugmentation";

const DatastreamProcessMetadataContent = (): React.ReactElement => {
    const {
        action: { toggleDatastreamModal },
    } = useEditorContext();
    const {
        state: processMetadata,
        action: {
            addTask,
            deleteTask,
            setMetadata,
            setProcessCreator,
            setProcessDateTime,
            setProcessLabel,
            setProcessOrganization,
            updateTaskAttributes,
        },
    } = useProcessMetadataContext();
    const [loading, setLoading] = useState<boolean>(true);

    const { uploadProcessMetadata, getProcessMetadata } = useDatastreamOperation();
    useEffect(() => {
        const loadProcessMetadata = async () => {
            const metadata = await getProcessMetadata();
            setMetadata(metadata);
            if ((metadata.tasks ?? []).length == 0) {
                addTask(0);
            }
            setLoading(false);
        };
        loadProcessMetadata();
    }, []);
    const tasks = (processMetadata.tasks ?? []).map((task, i) => {
        const callback = (attributes: Record<string, string>) => {
            updateTaskAttributes(i, attributes);
        };
        return (
            <DatastreamProcessMetadataTask
                key={JSON.stringify(task)}
                addBelow={() => {
                    addTask(i + 1);
                }}
                deleteTask={() => {
                    deleteTask(i);
                }}
                setAttributes={callback}
                task={task}
            />
        );
    });
    return loading ? (
        <DialogContent>Loading...</DialogContent>
    ) : (
        <>
            <DialogContent>
                <FormControl style={{ marginBottom: "10px" }}>
                    <FormLabel>Digital Provenance</FormLabel>
                </FormControl>
                <Grid container spacing={1} style={{ marginBottom: "10px" }}>
                    <Grid item xs={3}>
                        <FormControl fullWidth={true}>
                            <BlurSavingTextField
                                options={{ label: "Process Label" }}
                                value={processMetadata.processLabel ?? ""}
                                setValue={setProcessLabel}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <FormControl fullWidth={true}>
                            <BlurSavingTextField
                                options={{ label: "Process Creator" }}
                                value={processMetadata.processCreator ?? ""}
                                setValue={setProcessCreator}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                renderInput={(props) => <TextField {...props} />}
                                label="Process Date/Time"
                                value={processMetadata.processDateTime ?? ""}
                                onChange={setProcessDateTime}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={3}>
                        <FormControl fullWidth={true}>
                            <BlurSavingTextField
                                options={{ label: "Process Organization" }}
                                value={processMetadata.processOrganization ?? ""}
                                setValue={setProcessOrganization}
                            />
                        </FormControl>
                    </Grid>
                </Grid>
                {tasks.length > 0 ? tasks : <button onClick={() => addTask(0)}>Add Task</button>}
            </DialogContent>

            <DialogActions>
                <Button
                    className="uploadProcessMetadataButton"
                    onClick={async () => {
                        await uploadProcessMetadata(processMetadata);
                    }}
                >
                    Save
                </Button>
                <Button onClick={toggleDatastreamModal}>Cancel</Button>
            </DialogActions>
        </>
    );
};

export default DatastreamProcessMetadataContent;
