import React, { useEffect } from "react";
import Datastream from "./Datastream";
import List from "@mui/material/List";
import { useEditorContext } from "../../../context/EditorContext";

const DatastreamList = (): React.ReactElement => {
    const {
        state: { currentPid, modelsDatastreams },
        action: { getCurrentModelsDatastreams },
    } = useEditorContext();

    useEffect(() => {
        getCurrentModelsDatastreams();
    }, [currentPid]);

    return (
        <List>
            {modelsDatastreams.map((datastream, index) => (
                <Datastream datastream={datastream} key={index} />
            ))}
        </List>
    );
};

export default DatastreamList;
