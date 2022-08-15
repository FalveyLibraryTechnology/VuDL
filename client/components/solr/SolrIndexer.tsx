import React, { useState } from "react";
import SinglePidIndexer from "./SinglePidIndexer";
import PidRangeIndexer from "./PidRangeIndexer";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const SolrIndexer = (): React.ReactElement => {
    const [results, setResults] = useState("");

    return (
        <div>
            <h1>Solr Index Tool</h1>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>Index Single PID:</AccordionSummary>
                <AccordionDetails>
                    <SinglePidIndexer setResults={setResults} />
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>Index Range of PIDs:</AccordionSummary>
                <AccordionDetails>
                    <PidRangeIndexer setResults={setResults} />
                </AccordionDetails>
            </Accordion>
            <h2>Results:</h2>
            <pre id="solrIndexResults">{results}</pre>
        </div>
    );
};

export default SolrIndexer;
