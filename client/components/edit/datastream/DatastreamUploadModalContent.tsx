import React from "react";
import DialogContent from "@mui/material/DialogContent";
import useDatastreamOperation from "../../../hooks/useDatastreamOperation";

const DatastreamUploadModalContent = (): React.ReactElement => {
    const { uploadFile } = useDatastreamOperation();
    const onChange = (event) => {
        uploadFile(event.target.files[0]);
    };

    return (
        <DialogContent>
            <input className="uploadFileButton" type="file" onChange={onChange} />
        </DialogContent>
    );
};

export default DatastreamUploadModalContent;
