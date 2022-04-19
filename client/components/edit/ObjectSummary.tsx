import styles from "./ObjectSummary.module.css";
import React, { useEffect, useState } from "react";
import HtmlReactParser from "html-react-parser";
import { useFetchContext } from "../../context/FetchContext";
import { getObjectDetailsUrl } from "../../util/routes";

interface ObjectSummaryProps {
    pid: string;
}

const ObjectSummary = ({ pid = "" }: ObjectSummaryProps): React.ReactElement => {
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [details, setDetails] = useState([]);

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
                console.error("Problem fetching object details from " + url);
            }
            setDetails(data);
        }
        loadData();
    }, []);
    const metadata = details?.metadata ?? [];
    const title = extractMetadata(metadata, "dc:title", "Title not available");
    const description = extractMetadata(metadata, "dc:description", "");
    return (
        <div className={styles.infobox}>
            <h2>{title}</h2>
            <div>{HtmlReactParser(description)}</div>
        </div>
    );
};

export default ObjectSummary;
