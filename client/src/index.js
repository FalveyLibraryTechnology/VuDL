import React from "react";
import ReactDOM from "react-dom";

import "./css/normalize.css";
import "./css/application.css";
import "./css/client.css";
import "./css/justgrid.css";
import "../node_modules/@fortawesome/fontawesome-free/css/all.css";

import AjaxHelper from "./AjaxHelper";
import VuDLPrep from "./VuDLPrep";

let ajax = AjaxHelper.getInstance();
ajax.url = "http://localhost:9000/api"; // TODO: Config

ReactDOM.render(
    <React.StrictMode>
        <VuDLPrep />
    </React.StrictMode>,
    document.getElementById("root")
);
