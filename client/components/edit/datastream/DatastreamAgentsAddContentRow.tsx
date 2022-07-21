import React, { Dispatch, SetStateAction } from "react";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import IconButton from "@mui/material/IconButton";
import DatastreamAgentsContentRow from "./DatastreamAgentsContentRow";
import { useEditorContext } from "../../../context/EditorContext";

export interface Agent {
    role: string;
    type: string;
    name: string;
    notes: Array<string>;
}
export interface DatastreamAgentsAddContentRowProps {
    agent: Agent;
    setAgent: Dispatch<SetStateAction<Agent>>;
    setHasChanges: (hasChanges: boolean) => void;
}

const DatastreamAgentsAddContentRow = ({
    agent,
    setAgent,
    setHasChanges,
}: DatastreamAgentsAddContentRowProps): React.ReactElement => {
    const {
        state: { currentAgents },
        action: { setCurrentAgents },
    } = useEditorContext();
    const onChangeKey = (key: string, value: string | Array<string>) => {
        agent[key] = value;
        setAgent({ ...agent });
        setHasChanges(true);
    };
    const addAgent = () => {
        setCurrentAgents([...currentAgents, agent]);
        setAgent({
            role: "",
            type: "",
            name: "",
            notes: [],
        });
        setHasChanges(true);
    };
    return (
        <DatastreamAgentsContentRow
            agent={agent}
            additionalControls={
                <IconButton disabled={!agent.role || !agent.type || !agent.name} onClick={addAgent}>
                    <AddCircleOutline />
                </IconButton>
            }
            initialExpand={true}
            namesHelperText={
                !agent.role || !agent.type || !agent.name
                    ? "Role, type, and name fields must be filled in order to save the add row."
                    : ""
            }
            onRoleChange={(value) => onChangeKey("role", value)}
            onTypeChange={(value) => onChangeKey("type", value)}
            onNameChange={(value) => onChangeKey("name", value)}
            onNotesChange={(value) => onChangeKey("notes", value)}
        />
    );
};

export default DatastreamAgentsAddContentRow;
