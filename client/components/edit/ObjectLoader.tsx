import React, { useEffect } from "react";
import { useEditorContext } from "../../context/EditorContext";
import CircularProgress from "@mui/material/CircularProgress";

export interface ObjectLoaderProps {
    pid: string;
    errorCallback?: ((pid: string) => void) | null;
}

export const ObjectLoader = ({ pid, errorCallback = null }: ObjectLoaderProps): React.ReactElement | null => {
    const {
        state: { objectDetailsStorage },
        action: { loadObjectDetailsIntoStorage },
    } = useEditorContext();
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, pid);

    useEffect(() => {
        if (!loaded) {
            loadObjectDetailsIntoStorage(pid, errorCallback);
        }
    }, [loaded]);
    return !loaded ? (
        <>
            &nbsp;
            <CircularProgress size="1em" />
        </>
    ) : null;
};

export default ObjectLoader;
