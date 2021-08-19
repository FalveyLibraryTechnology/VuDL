import React from "react";
import { useStore } from "nanostores/react";

import { paginatorStore, toggleZoom } from "./paginator-store";

const ZoomToggleButton = () => {
    const { zoom } = useStore(paginatorStore);
    return <button onClick={toggleZoom}>{zoom ? "Turn Zoom Off" : "Turn Zoom On"}</button>;
};

export default ZoomToggleButton;
