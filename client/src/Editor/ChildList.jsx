import React from "react";
import PropTypes from "prop-types";

const ChildList = ({ pid = null }) => {
    return <div>{pid ?? "root"}</div>;
};

ChildList.propTypes = {
    pid: PropTypes.string,
};

export default ChildList;
