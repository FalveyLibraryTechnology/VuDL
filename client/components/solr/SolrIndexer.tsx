import React, { useState } from "react";
import { baseUrl } from "../../util/routes";
import { useFetchContext } from "../../context/FetchContext";
const SolrIndexer = (): React.ReactElement => {
    const [pid, setPid] = useState("");
    const [results, setResults] = useState("");
    const {
        action: { fetchText },
    } = useFetchContext();

    const doApiCall = async (method: string) => {
        try {
            setResults(await fetchText(`${baseUrl}/messenger/solrindex/${encodeURIComponent(pid)}`, { method }));
        } catch (error) {
            setResults(error.message);
        }
    };

    return (
        <div>
            <h1>Solr Index Tool</h1>
            <label>
                PID: <input type="text" id="solrIndexPid" value={pid} onChange={(e) => setPid(e.target.value)} />
            </label>
            <button id="solrIndexPreviewButton" onClick={() => doApiCall("GET")}>
                Preview
            </button>
            <button id="solrIndexIndexButton" onClick={() => doApiCall("POST")}>
                Index
            </button>
            <h2>Results:</h2>
            <pre id="solrIndexResults">{results}</pre>
        </div>
    );
};

export default SolrIndexer;
