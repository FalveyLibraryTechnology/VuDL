import React, { useEffect } from "react";
import { useEditorContext } from "../../context/EditorContext";
import CircularProgress from "@mui/material/CircularProgress";

export interface ObjectLoaderProps {
    pid: string;
}

export const ObjectLoader = ({ pid }: ObjectLoaderProps): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
        action: { loadObjectDetailsIntoStorage },
    } = useEditorContext();
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, pid);

    useEffect(() => {
        if (!loaded) {
            loadObjectDetailsIntoStorage(pid);
        }
    }, [loaded]);
    return !loaded ? (
        <>
            &nbsp;
            <CircularProgress size="1em" />
        </>
    ) : (
        <></>
    );
};

export default ObjectLoader;
