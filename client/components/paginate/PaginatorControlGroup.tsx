import React from "react";
import PropTypes from "prop-types";

const PaginatorControlGroup = ({ callback, children, label }) => {
    return (
        <div className="group" id={label}>
            {children.map((item) => (
                <button onClick={() => callback(item)} key={item}>
                    {item}
                </button>
            ))}
        </div>
    );
};

PaginatorControlGroup.propTypes = {
    callback: PropTypes.func,
    children: PropTypes.arrayOf(PropTypes.string),
    label: PropTypes.string,
};

export default PaginatorControlGroup;
