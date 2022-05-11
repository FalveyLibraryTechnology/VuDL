import React, { useEffect, useState } from "react";
import { useFetchContext } from "../../../context/FetchContext";
import { getObjectDetailsUrl } from "../../../util/routes";
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
        action: { fetchJSON },
    } = useFetchContext();
    const [details, setDetails] = useState({});
    const [loading, setLoading] = useState<boolean>(true);
    const [expanded, setExpanded] = useState<boolean>(false);

    // TODO: refactor this to share code with the ObjectSummary component:
    function extractMetadata(metadata, field, defaultValue) {
        const values = typeof metadata[field] === "undefined" ? [] : metadata[field];
        return values.length > 0 ? values[0] : defaultValue;
    }

    useEffect(() => {
        async function loadData() {
            let data = [];
            const url = getObjectDetailsUrl(pid);
            try {
                data = await fetchJSON(url);
            } catch (e) {
                console.error("Problem fetching tree data from " + url);
            }
            setDetails(data);
            setLoading(false);
        }
        loadData();
    }, []);
    const title = loading ? initialTitle : extractMetadata(details?.metadata ?? {}, "dc:title", "-");
    const loadingMessage = loading ? <p>Loading details...</p> : "";
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
