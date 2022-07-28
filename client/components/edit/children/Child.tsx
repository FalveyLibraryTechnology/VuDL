import React, { useState } from "react";
import { useEditorContext } from "../../../context/EditorContext";
import ChildList from "./ChildList";
import ChildPosition from "./ChildPosition";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import AddBox from "@mui/icons-material/AddBox";
import Refresh from "@mui/icons-material/Refresh";
import IndeterminateCheckBox from "@mui/icons-material/IndeterminateCheckBox";
import { extractFirstMetadataValue } from "../../../util/metadata";
import ObjectLoader from "../ObjectLoader";
import ObjectStatus from "../ObjectStatus";

export interface ChildProps {
    pid: string;
    parentPid: string;
    initialTitle: string;
}

export const Child = ({ pid, parentPid = "", initialTitle }: ChildProps): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
        action: { clearPidFromChildListStorage },
    } = useEditorContext();
    const [expanded, setExpanded] = useState<boolean>(false);
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, pid);
    const details = loaded ? objectDetailsStorage[pid] : {};

    const title = !loaded ? initialTitle : extractFirstMetadataValue(details?.metadata ?? {}, "dc:title", "-");
    const expandControl = (
        <span onClick={() => setExpanded(!expanded)}>
            {expanded ? <IndeterminateCheckBox titleAccess="Collapse Tree" /> : <AddBox titleAccess="Expand Tree" />}
        </span>
    );
    const childList = expanded ? <ChildList pid={pid} pageSize={10} /> : "";
    const refresh = () => {
        clearPidFromChildListStorage(pid);
    };
    return (
        <>
            <Grid container>
                <Grid item xs={8}>
                    {expandControl}
                    {loaded && parentPid ? <ChildPosition pid={pid} parentPid={parentPid} /> : ""}
                    <Link href={"/edit/object/" + pid}>{(title.length > 0 ? title : "-") + " [" + pid + "]"}</Link>
                </Grid>
                <Grid item xs={4}>
                    {loaded ? <ObjectStatus pid={pid} /> : ""}
                    <ObjectLoader pid={pid} />
                    <button onClick={refresh}><Refresh style={ { height: "14px" } } titleAccess="Refresh children" /></button>
                </Grid>
            </Grid>
            {childList}
        </>
    );
};

export default Child;
