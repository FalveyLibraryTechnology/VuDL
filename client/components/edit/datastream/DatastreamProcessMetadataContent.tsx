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

const DatastreamProcessMetadataContent = (): React.ReactElement => {
    const {
        action: { toggleDatastreamModal },
    } = useEditorContext();
    const {
        state: processMetadata,
        action: { setMetadata, setProcessCreator, setProcessDateTime, setProcessLabel, setProcessOrganization },
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
    return loading ? (
        <DialogContent>Loading...</DialogContent>
    ) : (
        <>
            <DialogContent>
                <FormControl>
                    <FormLabel>Digital Provenance</FormLabel>
                </FormControl>
                <br />
                <br />
                <Grid container spacing={1}>
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
