import React from "react";
import PropTypes from "prop-types";

const ZoomToggleButton = ({ toggleZoom, zoom }) => {
    return <button onClick={toggleZoom}>{`Turn Zoom ${zoom ? "Off" : "On"}`}</button>;
};

ZoomToggleButton.propTypes = {
    toggleZoom: PropTypes.func,
    zoom: PropTypes.bool,
};

export default ZoomToggleButton;
