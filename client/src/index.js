import React from "react";
import ReactDOM from "react-dom";
import "./css/normalize.css";
import "./css/application.css";
import "./css/client.css";
import "./css/justgrid.css";
import "../node_modules/@fortawesome/fontawesome-free/css/all.css";

import VuDLPrep from "./VuDLPrep";

ReactDOM.render(
    <React.StrictMode>
        <VuDLPrep url="http://localhost:9000/api" logoutUrl="" token="" />
    </React.StrictMode>,
    document.getElementById("root")
);
