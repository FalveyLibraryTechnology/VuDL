import React from "react";
import { useEditorContext } from "../../context/EditorContext";
import ObjectPreviewButton from "./ObjectPreviewButton";
import ObjectStatus from "./ObjectStatus";
import Refresh from "@mui/icons-material/Refresh";
import EditParentsButton from "./EditParentsButton";

export interface ObjectButtonBarProps {
    pid: string;
}

const ObjectButtonBar = ({ pid }: ObjectButtonBarProps): React.ReactElement => {
    const {
        action: { clearPidFromChildListStorage },
    } = useEditorContext();

    return (
        <>
            <ObjectStatus pid={pid} />
            <EditParentsButton pid={pid} />
            <button onClick={() => clearPidFromChildListStorage(pid)}>
                <Refresh style={{ height: "20px", verticalAlign: "sub" }} titleAccess="Refresh children" />
            </button>
            <ObjectPreviewButton pid={pid} />
        </>
    );
};

export default ObjectButtonBar;
