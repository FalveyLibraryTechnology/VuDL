import React, { useEffect, useState } from "react";
import { useEditorContext } from "../../../context/EditorContext";
import CircularProgress from "@mui/material/CircularProgress";
import ChildList from "./ChildList";
import Link from "next/link";
import AddBox from "@mui/icons-material/AddBox";
import IndeterminateCheckBox from "@mui/icons-material/IndeterminateCheckBox";
import { extractFirstMetadataValue } from "../../../util/metadata";

export interface ChildProps {
    pid: string;
    initialTitle: string;
}

export const Child = ({ pid, initialTitle }: ChildProps): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
        action: { loadObjectDetailsIntoStorage },
    } = useEditorContext();
    const [expanded, setExpanded] = useState<boolean>(false);
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, pid);
    const details = loaded ? objectDetailsStorage[pid] : {};

    useEffect(() => {
        if (!loaded) {
            loadObjectDetailsIntoStorage(pid);
        }
    }, []);
    const title = !loaded ? initialTitle : extractFirstMetadataValue(details?.metadata ?? {}, "dc:title", "-");
    const loadingMessage = !loaded ? (
        <>
            &nbsp;
            <CircularProgress size="1em" />
        </>
    ) : (
        ""
    );
    const expandControl = (
        <span onClick={() => setExpanded(!expanded)}>
            {expanded ? <IndeterminateCheckBox titleAccess="Collapse Tree" /> : <AddBox titleAccess="Expand Tree" />}
        </span>
    );
    const childList = expanded ? <ChildList pid={pid} pageSize={10} /> : "";
    return (
        <>
            {expandControl}
            <Link href={"/edit/object/" + pid}>{(title.length > 0 ? title : "-") + " [" + pid + "]"}</Link>
            {loadingMessage}
            {childList}
        </>
    );
};

export default Child;
