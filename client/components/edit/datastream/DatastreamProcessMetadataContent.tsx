import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import useDatastreamOperation from "../../../hooks/useDatastreamOperation";
import { useEditorContext } from "../../../context/EditorContext";
import { useProcessMetadataContext } from "../../../context/ProcessMetadataContext";
import BlurSavingTextField from "../../shared/BlurSavingTextField";
import Grid from "@mui/material/Grid";
import DatastreamProcessMetadataTask from "./DatastreamProcessMetadataTask";

let keyCounter = 0;

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
        },
    } = useProcessMetadataContext();
    const [loading, setLoading] = useState<boolean>(true);

    const { uploadProcessMetadata, getProcessMetadata } = useDatastreamOperation();
    useEffect(() => {
        const loadProcessMetadata = async () => {
            setMetadata(await getProcessMetadata());
            setLoading(false);
        };
        loadProcessMetadata();
    }, []);
    const tasks = (processMetadata.tasks ?? []).map((task, i) => {
        keyCounter++;
        const callback = (attribute, value) => {
            alert(`Set ${attribute} to ${value} at index ${i}`);
        };
        return (
            <DatastreamProcessMetadataTask
                key={`process_task_${keyCounter}`}
                addBelow={() => addTask(i + 1)}
                deleteTask={() => deleteTask(i)}
                setAttribute={callback}
                task={task}
            />
        );
    });
    return loading ? (
        <DialogContent>Loading...</DialogContent>
    ) : (
        <>
            <DialogContent>
                <FormControl style={{ "margin-bottom": "10px" }}>
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
                        <FormControl fullWidth={true}>
                            <BlurSavingTextField
                                options={{ label: "Process Date/Time" }}
                                value={processMetadata.processDateTime ?? ""}
                                setValue={setProcessDateTime}
                            />
                        </FormControl>
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
