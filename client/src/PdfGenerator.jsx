import React, { useState } from "react";

import AjaxHelper from "./AjaxHelper";

const PdfGenerator = () => {
    const [pid, setPid] = useState("");
    const [results, setResults] = useState("");

    const doApiCall = (method) => {
        const ajax = AjaxHelper.getInstance();
        const url = ajax.url + "/messenger/pdfgenerator/" + encodeURIComponent(pid);
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
    };

    return (
        <div>
            <h1>PDF Generator Tool</h1>
            <label>
                PID: <input type="text" id="pdfGeneratePid" value={pid} onChange={(e) => setPid(e.target.value)} />
            </label>
            <button onClick={() => doApiCall("POST")}>Generate</button>
            <h2>Results:</h2>
            <pre id="pdfGenerateResults">{results}</pre>
        </div>
    );
};

export default PdfGenerator;
