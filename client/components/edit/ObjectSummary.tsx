import styles from "./ObjectSummary.module.css";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import HtmlReactParser from 'html-react-parser';
import { useFetchContext } from "../../context/FetchContext";
import { apiUrl } from "../../util/routes";

const ObjectSummary = ({ pid = null }) => {
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [details, setDetails] = useState([]);

    function extractMetadata(metadata, field, defaultValue) {
        const values = typeof(metadata[field]) === "undefined" ? [] : metadata[field];
        return values.length > 0 ? values[0] : defaultValue;
    }

    useEffect(() => {
        async function loadData() {
            let data = [];
            const url = apiUrl + "/edit/object/details/" + encodeURIComponent(pid);
            try {
                data = await fetchJSON(url);
            } catch (e) {
                console.error("Problem fetching tree data from " + url);
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
            <div>{ HtmlReactParser(description) }</div>
        </div>
    );
};

ObjectSummary.propTypes = {
    pid: PropTypes.string,
};

export default ObjectSummary;
