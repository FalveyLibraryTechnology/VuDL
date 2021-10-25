import React from "react";
import PropTypes from "prop-types";

import PaginatorPreview from "./PaginatorPreview";
import PaginatorZoomy from "./PaginatorZoomy";

const JobPaginatorZoomToggle = ({ zoom, getJobImageUrl }) => {
    return zoom ? (
        <PaginatorZoomy img={getJobImageUrl("large")} />
    ) : (
        <PaginatorPreview img={getJobImageUrl("medium")} />
    );
};

JobPaginatorZoomToggle.propTypes = {
    zoom: PropTypes.bool,
    getJobImageUrl: PropTypes.func,
};

export default JobPaginatorZoomToggle;
