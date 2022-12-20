import React from "react";

interface ZoomToggleButtonProps {
    toggleZoom: React.MouseEventHandler<HTMLButtonElement>;
    zoom: boolean;
}

const ZoomToggleButton = ({ toggleZoom, zoom }: ZoomToggleButtonProps): React.ReactElement => {
    return <button onClick={toggleZoom}>{`Turn Zoom ${zoom ? "Off" : "On"}`}</button>;
};

export default ZoomToggleButton;
