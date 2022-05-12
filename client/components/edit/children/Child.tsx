import React, { useEffect, useState } from "react";
import { useChildListContext } from "../../../context/ChildListContext";
import CircularProgress from "@mui/material/CircularProgress";
import ChildList from "./ChildList";
import Link from "next/link";
import AddBox from "@mui/icons-material/AddBox";
import IndeterminateCheckBox from "@mui/icons-material/IndeterminateCheckBox";

export interface ChildProps {
    pid: string;
    initialTitle: string;
}

export const Child = ({ pid, initialTitle }: ChildProps): React.ReactElement => {
    const {
        state: { childDetailsStorage },
        action: { loadChildDetailsIntoStorage },
    } = useChildListContext();
    const [expanded, setExpanded] = useState<boolean>(false);
    const loaded = Object.prototype.hasOwnProperty.call(childDetailsStorage, pid);
    const details = loaded ? childDetailsStorage[pid] : {};

    // TODO: refactor this to share code with the ObjectSummary component:
    function extractMetadata(metadata, field, defaultValue) {
        const values = typeof metadata[field] === "undefined" ? [] : metadata[field];
        return values.length > 0 ? values[0] : defaultValue;
    }

    useEffect(() => {
        if (!loaded) {
            loadChildDetailsIntoStorage(pid);
        }
    }, []);
    const title = !loaded ? initialTitle : extractMetadata(details?.metadata ?? {}, "dc:title", "-");
    const loadingMessage = !loaded ? <>&nbsp;<CircularProgress size="1em" /></> : "";
    const expandControl = <span onClick={() => setExpanded(!expanded)}>{expanded ? <IndeterminateCheckBox titleAccess="Collapse Tree" /> : <AddBox titleAccess="Expand Tree" />}</span>;
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
