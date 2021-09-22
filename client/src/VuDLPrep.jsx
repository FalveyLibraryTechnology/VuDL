import React from "react";
import { BrowserRouter } from "react-router-dom";
import PropTypes from "prop-types";

import Routes from "./Routes";
import LogoutButton from "./LogoutButton";

const VuDLPrep = () => {
    return (
        <div>
            <div className="logout">
                <LogoutButton />
            </div>
            <BrowserRouter>
                <Routes />
            </BrowserRouter>
        </div>
    );
};

VuDLPrep.propTypes = {
    logoutUrl: PropTypes.string,
    token: PropTypes.string,
};

export default VuDLPrep;
