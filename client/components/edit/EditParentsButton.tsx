import React from "react";
import { useEditorContext } from "../../context/EditorContext";
import ObjectLoader from "./ObjectLoader";

export interface ObjectStatusProps {
    pid: string;
}

export const EditParentsButton = ({ pid }: ObjectStatusProps): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
        action: { setParentsModalActivePid, toggleParentsModal },
    } = useEditorContext();
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, pid);

    const clickAction = () => {
        setParentsModalActivePid(pid);
        toggleParentsModal();
    };
    const button = loaded ? (
        <button onClick={clickAction}>Edit Parents</button>
    ) : null;
    return (
        <>
            <ObjectLoader pid={pid} />
            {button}
        </>
    );
};

export default EditParentsButton;
