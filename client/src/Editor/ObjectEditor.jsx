import React from "react";
import PropTypes from "prop-types";
import ChildList from "./ChildList";
import { Link } from "react-router-dom";

const ObjectEditor = ({ pid }) => {
    return (
        <div>
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
