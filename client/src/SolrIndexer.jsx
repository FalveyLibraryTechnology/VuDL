import React, { useState } from "react";
import { baseUrl } from "./routes";
import { useFetchContext } from "./FetchContext";
const SolrIndexer = () => {
    const [pid, setPid] = useState("");
    const [results, setResults] = useState("");
    const {
        action: { fetchText },
    } = useFetchContext();

    const doApiCall = async (method) => {
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
            <button onClick={() => doApiCall("GET")}>Preview</button>
            <button onClick={() => doApiCall("POST")}>Index</button>
            <h2>Results:</h2>
            <pre id="solrIndexResults">{results}</pre>
        </div>
    );
};

export default SolrIndexer;
