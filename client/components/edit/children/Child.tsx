import React, { useEffect, useState } from "react";
import { useFetchContext } from "../../../context/FetchContext";
import { getObjectDetailsUrl } from "../../../util/routes";
import Link from "next/link";

export interface ChildProps {
    pid: string;
    initialTitle: string;
}

export const Child = ({ pid , initialTitle }: ChildProps): React.ReactElement => {
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [details, setDetails] = useState({});
    const [loading, setLoading] = useState<boolean>(true);

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
    return (
        <>
            <Link href={"/edit/object/" + pid}>{(title.length >  0 ? title : "-") + " [" + pid + "]"}</Link>
            { loadingMessage }
        </>
    );
};

export default Child;
