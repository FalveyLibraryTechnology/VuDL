import React from "react";
import { useEditorContext } from "../../context/EditorContext";

export interface ObjectStatusProps {
    pid: string;
}

export const EditParentsButton = ({ pid }: ObjectStatusProps): React.ReactElement => {
    const {
        action: { setParentsModalActivePid, toggleParentsModal },
    } = useEditorContext();

    const clickAction = () => {
        setParentsModalActivePid(pid);
        toggleParentsModal();
    };
    return <button onClick={clickAction}>Edit Parents</button>;
};

export default EditParentsButton;
