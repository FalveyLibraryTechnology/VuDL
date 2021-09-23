import React from "react";
import PropTypes from "prop-types";

const ZoomToggleButton = ({ paginator }) => {
    return <button onClick={paginator.toggleZoom}>{`Turn Zoom ${paginator.state.zoom ? "Off" : "On"}`}</button>;
};

ZoomToggleButton.propTypes = {
    // JobPaginator
    paginator: PropTypes.shape({
        toggleZoom: PropTypes.func,
        state: PropTypes.shape({
            zoom: PropTypes.bool,
        }),
    }),
};

export default ZoomToggleButton;
