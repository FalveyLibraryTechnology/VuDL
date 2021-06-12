import React from "react";
import AjaxHelper from "./AjaxHelper";

export default function SolrIndexer() {
    function doApiCall(method) {
        const ajax = AjaxHelper.getInstance();
        const pid = document.getElementById("solrIndexPid").value;
        const url = ajax.url + "/messenger/solrindex/" + encodeURIComponent(pid);
        ajax.ajax({
            method: method,
            url: url,
            dataType: "text",
            error: function (result, status) {
                document.getElementById("solrIndexResults").innerHTML = status;
            },
            success: function (result) {
                document.getElementById("solrIndexResults").innerHTML = result;
            },
        });
    }

    function preview() {
        doApiCall("GET");
    }

    function index() {
        doApiCall("POST");
    }

    return (
        <div>
            <h1>Solr Index Tool</h1>
            <label>
                PID: <input type="text" id="solrIndexPid" />
            </label>
            <button onClick={preview}>Preview</button>
            <button onClick={index}>Index</button>
            <h2>Results:</h2>
            <pre id="solrIndexResults"></pre>
        </div>
    );
}
