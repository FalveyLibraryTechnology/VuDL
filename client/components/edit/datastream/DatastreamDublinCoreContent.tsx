import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import { useEditorContext } from "../../../context/EditorContext";
import useDatastreamOperation from "../../../hooks/useDatastreamOperation";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import DatastreamAgentsAddContentRow from "./DatastreamAgentsAddContentRow";
import DatastreamAgentsModifyContentRow from "./DatastreamAgentsModifyContentRow";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const DatastreamDublinCoreContent = (): React.ReactElement => {
    const {
        state: { currentPid, objectDetailsStorage },
        action: { toggleDatastreamModal },
    } = useEditorContext();
    //const { uploadMetadata } = useDatastreamOperation();
    const [metadata, setMetadata] = useState({});
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, currentPid);
    useEffect(() => {
        if (loaded) {
            setMetadata(objectDetailsStorage[currentPid].metadata ?? {});
        }
    }, [loaded]);

    return (
        <>
            Metadata modal! {JSON.stringify(metadata)}
        </>
    );
};

export default DatastreamDublinCoreContent;
