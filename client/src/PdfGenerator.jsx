import React, { useState } from "react";
import { baseUrl } from "./routes";
import { useFetchContext } from "./context";

const PdfGenerator = () => {
    const [pid, setPid] = useState("");
    const [results, setResults] = useState("");
    const {
        action: { fetchText },
    } = useFetchContext();

    const doApiCall = async (method) => {
        try {
            setResults(await fetchText(`${baseUrl}/messenger/pdfgenerator/${encodeURIComponent(pid)}`, { method }));
        } catch (error) {
            setResults(error.message);
        }
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
