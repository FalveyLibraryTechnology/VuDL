import React, { useState } from "react";
import SinglePidIndexer from "./SinglePidIndexer"
const SolrIndexer = (): React.ReactElement => {
    const [results, setResults] = useState("");

    return (
        <div>
            <h1>Solr Index Tool</h1>
            <SinglePidIndexer setResults={setResults} />
            <h2>Results:</h2>
            <pre id="solrIndexResults">{results}</pre>
        </div>
    );
};

export default SolrIndexer;
