import React from "react";
import IconButton from "@mui/material/IconButton";
import DatastreamAgentsContentRow from "./DatastreamAgentsContentRow";
import RemoveCircle from "@mui/icons-material/RemoveCircle";
import { useEditorContext } from "../../../context/EditorContext";

export interface Agent {
    role: string;
    type: string;
    name: string;
    notes: Array<string>;
}
export interface DatastreamAgentsModifyContentRowProps {
    agent: Agent;
    index: number;
    setHasChanges: (hasChanges: boolean) => void;
}

const DatastreamAgentsModifyContentRow = ({
    agent,
    index,
    setHasChanges,
}: DatastreamAgentsModifyContentRowProps): React.ReactElement => {
    const {
        state: { currentAgents },
        action: { setCurrentAgents },
    } = useEditorContext();
    const removeAgent = () => {
        currentAgents.splice(index, 1);
        setCurrentAgents([...currentAgents]);
        setHasChanges(true);
    };
    const onChangeKey = (key, value) => {
        currentAgents[index][key] = value;
        setCurrentAgents([...currentAgents]);
        setHasChanges(true);
    };

    return (
        <DatastreamAgentsContentRow
            agent={agent}
            additionalControls={
                <IconButton onClick={() => removeAgent()}>
                    <RemoveCircle />
                </IconButton>
            }
            initialExpand={false}
            onRoleChange={(value) => onChangeKey("role", value)}
            onTypeChange={(value) => onChangeKey("type", value)}
            onNameChange={(value) => onChangeKey("name", value)}
            onNotesChange={(value) => onChangeKey("notes", value)}
        />
    );
};

export default DatastreamAgentsModifyContentRow;
