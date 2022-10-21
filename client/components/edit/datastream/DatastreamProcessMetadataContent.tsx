import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import useDatastreamOperation from "../../../hooks/useDatastreamOperation";
import { useEditorContext } from "../../../context/EditorContext";

const DatastreamProcessMetadataContent = (): React.ReactElement => {
    const {
        action: { toggleDatastreamModal },
    } = useEditorContext();
    const { uploadProcessMetadata, getProcessMetadata } = useDatastreamOperation();
    const [processMetadata, setProcessMetadata] = useState([]);
    useEffect(() => {
        const loadProcessMetadata = async () => {
            setProcessMetadata(await getProcessMetadata());
        };
        loadProcessMetadata();
    }, []);
    return (
        <>
            <DialogContent>
                <FormControl>
                    <FormLabel>Digital Provenance</FormLabel>
                </FormControl>
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
