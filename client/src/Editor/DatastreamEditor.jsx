import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useFetchContext } from "../FetchContext";
import { apiUrl } from "../routes";

const DatastreamEditor = ({ pid }) => {
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [details, setDetails] = useState([]);

    useEffect(() => {
        async function loadData() {
            let data = [];
            const url = apiUrl + "/edit/object/details" + (pid === null ? "" : "/" + pid);
            try {
                data = await fetchJSON(url);
            } catch (e) {
                console.error("Problem fetching object data from " + url);
            }
            setDetails(data);
        }
        loadData();
    }, []);
    return (
        <>
            <h2>Datastream Editor</h2>
            <h3>Models</h3>
            {(details?.models ?? []).map((model) => {
                return <div key={"model_" + model}>{model}</div>;
            })}
            <h3>Datastreams</h3>
            {(details?.datastreams ?? []).map((stream) => {
                return <div key={"stream_" + stream}>{stream}</div>;
            })}
        </>
    );
};

DatastreamEditor.propTypes = {
    pid: PropTypes.string,
};

export default DatastreamEditor;
