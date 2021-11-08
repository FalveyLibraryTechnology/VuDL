import React from "react";
import PropTypes from "prop-types";
import ChildList from "./ChildList";

const ObjectEditor = ({ pid }) => {
    return (
        <div>
            <p>You are editing {pid}</p>
            <ChildList pid={pid} />
        </div>
    );
};

ObjectEditor.propTypes = {
    pid: PropTypes.string,
};

export default ObjectEditor;
