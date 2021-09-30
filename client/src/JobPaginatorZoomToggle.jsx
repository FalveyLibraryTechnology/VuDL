import React from "react";
import PropTypes from "prop-types";

import PaginatorPreview from "./PaginatorPreview";
import PaginatorZoomy from "./PaginatorZoomy";

const JobPaginatorZoomToggle = ({ zoom, getImageUrl }) => {
    return zoom ? <PaginatorZoomy img={getImageUrl("large")} /> : <PaginatorPreview img={getImageUrl("medium")} />;
};

JobPaginatorZoomToggle.propTypes = {
    zoom: PropTypes.bool,
    getImageUrl: PropTypes.func,
};

export default JobPaginatorZoomToggle;
