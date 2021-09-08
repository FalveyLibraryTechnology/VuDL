import React, { useState } from "react";
import AjaxHelper from "./AjaxHelper";

const SolrIndexer = () => {
    const [pid, setPid] = useState("");
    const [results, setResults] = useState("");

    function doApiCall(method) {
        const ajax = AjaxHelper.getInstance();
        const url = ajax.url + "/messenger/solrindex/" + encodeURIComponent(pid);
        ajax.ajax({
            method: method,
            url: url,
            dataType: "text",
            error: function (result, status) {
                setResults(status);
            },
            success: function (result) {
                setResults(result);
            },
        });
    }

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
