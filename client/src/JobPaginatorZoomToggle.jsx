import React from "react";
import PropTypes from "prop-types";

import PaginatorPreview from "./PaginatorPreview";
import PaginatorZoomy from "./PaginatorZoomy";

const JobPaginatorZoomToggle = ({ enabled = true, zoom, getJobImageUrl }) => {
    if (!enabled) {
        return <div>Preview not available.</div>;
    }
    return zoom ? (
        <PaginatorZoomy img={getJobImageUrl("large")} />
    ) : (
        <PaginatorPreview img={getJobImageUrl("medium")} />
    );
};

JobPaginatorZoomToggle.propTypes = {
    enabled: PropTypes.bool,
    zoom: PropTypes.bool,
    getJobImageUrl: PropTypes.func,
};

export default JobPaginatorZoomToggle;
