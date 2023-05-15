import React from "react";
import Datastream from "./Datastream";
import List from "@mui/material/List";
import { useEditorContext } from "../../../context/EditorContext";

interface Datastream {
    disabled: boolean;
    stream: string;
}

const DatastreamList = (): React.ReactElement => {
    const {
        state: { modelsDatastreams },
    } = useEditorContext();
    return (
        <List>
            {modelsDatastreams
                .sort((a: Datastream, b: Datastream) => {
                    return a.stream.localeCompare(b.stream);
                })
                .map((datastream: Datastream, index: number) => (
                    <Datastream datastream={datastream} key={index} />
                ))}
        </List>
    );
};

export default DatastreamList;
