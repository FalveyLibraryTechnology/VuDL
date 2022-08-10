import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useEditorContext } from "../../context/EditorContext";
import { useFetchContext } from "../../context/FetchContext";
import ObjectLoader from "./ObjectLoader";
import { getObjectParentsUrl } from "../../util/routes";
import { TreeNode } from "../../util/Breadcrumbs";

const ParentsModal = (): React.ReactElement => {
    const {
        state: { isParentsModalOpen, objectDetailsStorage, parentsModalActivePid },
        action: { setSnackbarState, toggleParentsModal },
    } = useEditorContext();
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [parentData, setParentData] = useState<TreeNode>({});
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, parentsModalActivePid);
    const details = loaded ? objectDetailsStorage[parentsModalActivePid] : {};

    useEffect(() => {
        if (!isParentsModalOpen || parentsModalActivePid === null) {
            return;
        }
        async function loadData() {
            let data: TreeNode = {
                pid: parentsModalActivePid,
                title: details.title ?? "",
                parents: [],
            };
            const url = getObjectParentsUrl(parentsModalActivePid);
            try {
                data = await fetchJSON(url);
            } catch (e) {
                console.error("Problem fetching breadcrumb data from " + url);
            }
            setParentData(data);
        }
        loadData();
    }, [isParentsModalOpen, parentsModalActivePid]);

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
            <tr key={"parentmodal_" + parentsModalActivePid + "_" + parent.pid}>
                <td>
                    <button onClick={() => showSnackbarMessage("TODO", "info")}>X</button>
                </td>
                <td>{parent.pid ?? ""}</td>
                <td>{parent.title ?? "Unknown title"}</td>
                <td>{parentChain}</td>
            </tr>
        );
    });
    const contents = (
        <>
            <h3>Parents</h3>
            <table border="1">
                <tbody>
                    {parents.length > 0 ? (
                        parents
                    ) : (
                        <tr key={"parentmodal_" + parentsModalActivePid + "_null"}>
                            <td>No parents defined.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    );

    return (
        <Dialog className="parentsModal" open={isParentsModalOpen} onClose={toggleParentsModal} fullWidth={true}>
            <DialogTitle>
                <Grid container>
                    <Grid item xs={11}>
                        Parents Editor ({parentsModalActivePid})
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton className="closeButton" onClick={toggleParentsModal}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                {parentsModalActivePid ? <ObjectLoader pid={parentsModalActivePid} /> : ""}
                {contents}
            </DialogContent>
        </Dialog>
    );
};

export default ParentsModal;
