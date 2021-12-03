import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useFetchContext } from "../FetchContext";
import { apiUrl } from "../routes";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ pid = null }) => {
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    useEffect(() => {
        async function loadData() {
            let data = [];
            const url = apiUrl + "/edit/breadcrumbs" + (pid === null ? "" : "/" + pid);
            try {
                data = await fetchJSON(url);
            } catch (e) {
                console.error("Problem fetching breadcrumb data from " + url);
            }
            setBreadcrumbs(data);
        }
        loadData();
    }, []);
    const contents = (breadcrumbs.parents ?? []).map((breadcrumb) => {
        return (
            <li key={(breadcrumb.pid ?? "root") + breadcrumb.pid}>
                <Link to={"/edit/object/" + breadcrumb.pid}>{breadcrumb.title}</Link>
            </li>
        );
    });
    return <ul>{contents}</ul>;
};

Breadcrumbs.propTypes = {
    pid: PropTypes.string,
};

export default Breadcrumbs;
