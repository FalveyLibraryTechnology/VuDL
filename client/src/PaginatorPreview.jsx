import React from "react";
import PropTypes from "prop-types";

const PaginatorPreview = ({ img }) => {
    return <div className="preview">{img ? <img className="preview-image" src={img} alt="" /> : ""}</div>;
};

PaginatorPreview.propTypes = {
    img: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

export default PaginatorPreview;
