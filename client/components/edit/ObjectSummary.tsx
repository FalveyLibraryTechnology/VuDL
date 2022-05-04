import styles from "./ObjectSummary.module.css";
import React from "react";
import HtmlReactParser from "html-react-parser";
import { useEditorContext } from "../../context/EditorContext";

const ObjectSummary = (): React.ReactElement => {
    const {
        state: { loading },
        action: { extractFirstMetadataValue },
    } = useEditorContext();

    const title = loading ? "Loading..." : extractFirstMetadataValue("dc:title", "Title not available");
    const description = extractFirstMetadataValue("dc:description", "");
    return (
        <div className={styles.infobox}>
            <h2>{title}</h2>
            <div>{HtmlReactParser(description)}</div>
        </div>
    );
};

export default ObjectSummary;
