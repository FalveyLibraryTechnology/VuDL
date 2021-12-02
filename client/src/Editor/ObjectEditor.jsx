import React from "react";
import PropTypes from "prop-types";
import ChildList from "./ChildList";
import Breadcrumbs from "./Breadcrumbs";
import { Link } from "react-router-dom";

const ObjectEditor = ({ pid }) => {
    return (
        <div>
            <Breadcrumbs pid={pid} />
            <h1>Editor: Object {pid}</h1>
            <h2>Tools</h2>
            <ul>
                <li>
                    <Link to={`/edit/object/${pid}/newChild`}>Create New Child Object</Link>
                </li>
            </ul>
            <h2>Contents</h2>
            <ChildList pid={pid} />
        </div>
    );
};

ObjectEditor.propTypes = {
    pid: PropTypes.string,
};

export default ObjectEditor;
