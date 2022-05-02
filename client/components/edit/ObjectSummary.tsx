import styles from "./ObjectSummary.module.css";
import React, { useEffect, useState } from "react";
import HtmlReactParser from "html-react-parser";
import { useFetchContext } from "../../context/FetchContext";
import { getObjectDetailsUrl } from "../../util/routes";

interface ObjectSummaryProps {
    pid: string;
}

interface ObjectDetails {
    metadata: Record<string, Array<string>>;
}

const ObjectSummary = ({ pid = "" }: ObjectSummaryProps): React.ReactElement => {
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [details, setDetails] = useState<ObjectDetails>({ metadata: {} });
    const [loading, setLoading] = useState(true);

    function extractMetadata(metadata: Record<string, Array<string>>, field: string, defaultValue: string) {
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
                console.error("Problem fetching object details from " + url);
            }
            setDetails(data);
            setLoading(false);
        }
        loadData();
    }, []);
    const metadata = details?.metadata ?? [];
    const title = loading ? "Loading..." : extractMetadata(metadata, "dc:title", "Title not available");
    const description = extractMetadata(metadata, "dc:description", "");
    return (
        <div className={styles.infobox}>
            <h2>{title}</h2>
            <div>{HtmlReactParser(description)}</div>
        </div>
    );
};

export default ObjectSummary;
