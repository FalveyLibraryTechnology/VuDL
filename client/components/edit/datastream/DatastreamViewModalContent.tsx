import React, { useEffect, useState } from "react";
import DialogContent from "@mui/material/DialogContent";
import useDatastreamOperation from "../../../hooks/useDatastreamOperation";
import DatatypeContent from "../../shared/DatatypeContent";
import CircularProgress from "@mui/material/CircularProgress";
import { useEditorContext } from "../../../context/EditorContext";

const DatastreamViewModalContent = (): React.ReactElement => {
    const [content, setContent] = useState({
        data: "",
        mimeType: "",
    });
    const {
        state: { activeDatastream },
    } = useEditorContext();
    const { downloadDatastream, viewDatastream } = useDatastreamOperation();
    useEffect(() => {
        const getDatastream = async () => {
            const content = await viewDatastream();
            setContent(content);
        };
        getDatastream();
    }, []);
    const { data, mimeType } = content;

    if (mimeType === "image/tiff") {
        return (
            <DialogContent sx={{ minHeight: "50vh" }}>
                <p>
                    The MIME type {mimeType} cannot be displayed in your browser. Please{" "}
                    <button onClick={() => downloadDatastream(activeDatastream)}>download</button> the file instead.
                </p>
            </DialogContent>
        );
    }
    if (data) {
        return (
            <DialogContent sx={{ minHeight: "50vh" }}>
                <DatatypeContent data={data} mimeType={mimeType} />
            </DialogContent>
        );
    }
    return (
        <DialogContent sx={{ minHeight: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress size="60px" />;
        </DialogContent>
    );
};

export default DatastreamViewModalContent;
