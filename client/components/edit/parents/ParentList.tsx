import React, { useEffect } from "react";
import { useEditorContext } from "../../../context/EditorContext";

export interface ParentListProps {
    pid: string;
}

const ParentList = ({ pid }: ParentListProps): React.ReactElement => {
    const {
        state: { parentDetailsStorage },
        action: { loadParentDetailsIntoStorage, setSnackbarState },
    } = useEditorContext();
    const loaded = Object.prototype.hasOwnProperty.call(parentDetailsStorage, pid);

    useEffect(() => {
        if (!loaded) {
            loadParentDetailsIntoStorage(pid);
        }
    }, [loaded]);

    const showSnackbarMessage = (message: string, severity: string) => {
        setSnackbarState({
            open: true,
            message,
            severity,
        });
    };

    const parents = (loaded ? parentDetailsStorage[pid].parents ?? [] : []).map((parent) => {
        let parentChain = "";
        let nextNode = (parent.parents ?? [])[0] ?? null;
        while (nextNode) {
            parentChain = nextNode.title + (parentChain.length ? "/" : "") + parentChain;
            nextNode = (nextNode.parents ?? [])[0] ?? null;
        }
        return (
            <tr key={"parentmodal_" + pid + "_" + parent.pid}>
                <td>
                    <button onClick={() => showSnackbarMessage("TODO", "info")}>X</button>
                </td>
                <td>{parent.pid ?? ""}</td>
                <td>{parent.title ?? "Unknown title"}</td>
                <td>{parentChain}</td>
            </tr>
        );
    });
    return (
        <table border="1">
            <tbody>
                {parents.length > 0 ? (
                    parents
                ) : (
                    <tr key={"parentmodal_" + pid + "_null"}>
                        <td>{loaded ? "No parents defined." : "Loading..."}</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default ParentList;
