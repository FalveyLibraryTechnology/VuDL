import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useFetchContext } from "../context";
import { apiUrl } from "../routes";
import { Link } from "react-router-dom";

const ChildList = ({ pid = null }) => {
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [children, setChildren] = useState([]);

    useEffect(() => {
        async function loadData() {
            let data = [];
            const url = apiUrl + "/edit/object/children" + (pid === null ? "" : "/" + pid);
            try {
                data = await fetchJSON(url);
            } catch (e) {
                console.error("Problem fetching tree data from " + url);
            }
            setChildren(data);
        }
        loadData();
    }, []);
    const contents = (children?.docs ?? []).map((child) => {
        return (
            <li key={pid + "child" + child.id}>
                <Link to={"/edit/object/" + child.id}>{child.title}</Link>
            </li>
        );
    });
    return <ul>{contents}</ul>;
};

ChildList.propTypes = {
    pid: PropTypes.string,
};

export default ChildList;
