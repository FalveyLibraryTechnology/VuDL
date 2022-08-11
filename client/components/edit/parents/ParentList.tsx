import React, { useEffect } from "react";
import { useEditorContext } from "../../../context/EditorContext";
import { useFetchContext } from "../../../context/FetchContext";
import { getParentUrl } from "../../../util/routes";
import Delete from "@mui/icons-material/Delete";

export interface ParentListProps {
    pid: string;
}

const ParentList = ({ pid }: ParentListProps): React.ReactElement => {
    const {
        state: { parentDetailsStorage },
        action: {
            clearPidFromChildListStorage,
            loadParentDetailsIntoStorage,
            removeFromObjectDetailsStorage,
            removeFromParentDetailsStorage,
            setSnackbarState,
        },
    } = useEditorContext();
    const {
        action: { fetchText },
    } = useFetchContext();
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

    const deleteParent = async (parentPid: string) => {
        if (!confirm("Are you sure you wish to remove this parent?")) {
            return;
        }
        const target = getParentUrl(pid, parentPid);
        let result: string;
        try {
            result = await fetchText(target, { method: "DELETE" });
        } catch (e) {
            result = (e as Error).message ?? "Unexpected error";
        }
        if (result === "ok") {
            // Clear and reload the cached object and its parents, since these have now changed!
            removeFromObjectDetailsStorage(pid);
            removeFromParentDetailsStorage(pid);
            // Clear any cached lists belonging to the parent PID, because the
            // order has potentially changed!
            clearPidFromChildListStorage(parentPid);
            showSnackbarMessage(`Successfully removed ${pid} from ${parentPid}`, "info");
        } else {
            showSnackbarMessage(result, "error");
        }
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
                    <button onClick={() => deleteParent(parent.pid)}>
                        <Delete titleAccess={`Delete parent ${parent.pid}`} />
                    </button>
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
