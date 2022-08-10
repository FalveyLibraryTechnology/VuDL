import React, { useEffect, useState } from "react";
import { useEditorContext } from "../../../context/EditorContext";
import { useFetchContext } from "../../../context/FetchContext";
import { getObjectParentsUrl } from "../../../util/routes";
import { TreeNode } from "../../util/Breadcrumbs";

export interface ParentListProps {
    pid: string;
}

const ParentList = ({ pid }: ParentListProps): React.ReactElement => {
    const {
        action: { setSnackbarState },
    } = useEditorContext();
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [parentData, setParentData] = useState<TreeNode>({});

    useEffect(() => {
        if (pid === null) {
            return;
        }
        async function loadData() {
            let data: TreeNode = {
                pid: pid,
                title: "Loading...",
                parents: [],
            };
            const url = getObjectParentsUrl(pid);
            try {
                data = await fetchJSON(url);
            } catch (e) {
                console.error("Problem fetching breadcrumb data from " + url);
            }
            setParentData(data);
        }
        loadData();
    }, []);

    const showSnackbarMessage = (message: string, severity: string) => {
        setSnackbarState({
            open: true,
            message,
            severity,
        });
    };

    const parents = (parentData.parents ?? []).map((parent) => {
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
                        <td>No parents defined.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default ParentList;
