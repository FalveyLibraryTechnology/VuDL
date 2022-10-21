import React from "react";
import { useEditorContext } from "../../context/EditorContext";
import ObjectStatus from "./ObjectStatus";
import Refresh from "@mui/icons-material/Refresh";
import EditParentsButton from "./EditParentsButton";

export interface ObjectButtonBarProps {
    pid: string;
}

const ObjectButtonBar = ({ pid }: ObjectButtonBarProps): React.ReactElement => {
    const {
        state: { vufindUrl },
        action: { clearPidFromChildListStorage },
    } = useEditorContext();

    const preview =
        vufindUrl.length > 0 ? (
            <button
                onClick={() => {
                    window.open(vufindUrl + "/Item/" + pid);
                }}
            >
                Preview
            </button>
        ) : null;

    return (
        <>
            <ObjectStatus pid={pid} />
            <EditParentsButton pid={pid} />
            <button onClick={() => clearPidFromChildListStorage(pid)}>
                <Refresh style={{ height: "14px" }} titleAccess="Refresh children" />
            </button>
            {preview}
        </>
    );
};

export default ObjectButtonBar;
