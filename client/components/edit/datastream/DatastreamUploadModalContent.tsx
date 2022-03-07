import React from "react";
import { Box, DialogContent } from "@mui/material";
import { useState } from "react";
import { useEditorContext } from "../../../context/EditorContext";
import { useFetchContext } from "../../../context/FetchContext";
import { postObjectDatastreamUrl } from "../../../util/routes";

const DatastreamUploadModalContent = () => {
    const {
        action: { fetchText },
    } = useFetchContext();
    const {
        state: { currentPid, activeDatastream, datastreamsCatalog },
    } = useEditorContext();
    const [{ state, text }, setResponseText] = useState({
        state: "init",
        text: "",
    });
    const isAllowedMimeType = (mimeType) => {
        if (!datastreamsCatalog[activeDatastream]) {
            return false;
        }
        const [type, subtype] = mimeType.split("/");
        const { allowedType, allowedSubtypes } = datastreamsCatalog[activeDatastream].mimetype;
        return (
            (allowedType.includes(type) || allowedType.includes("*")) &&
            (allowedSubtypes.includes(subtype) || allowedSubtypes.includes("*"))
        );
    };

    const uploadFile = async (file) => {
        try {
            if (!isAllowedMimeType(file.type)) {
                throw new Error(`Illegal mime type: ${file.type}`);
            }
            const body = new FormData();
            body.append("stream", activeDatastream);
            body.append("file", file);
            const text = await fetchText(postObjectDatastreamUrl(currentPid), {
                method: "POST",
                body,
            });
            setResponseText({
                state: "success",
                text,
            });
        } catch (err) {
            setResponseText({
                state: "error",
                text: err.message,
            });
        }
    };
    const onChange = (event) => {
        uploadFile(event.target.files[0]);
    };

    return (
        <DialogContent>
            <input className="uploadFileButton" type="file" onChange={onChange} />
            {state != "init" && (
                <Box className="responseText" sx={{ color: `${state}.main`, textAlign: "center" }}>
                    {text}
                </Box>
            )}
        </DialogContent>
    );
};

export default DatastreamUploadModalContent;
