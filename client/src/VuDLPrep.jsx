import React from "react";
import { BrowserRouter } from "react-router-dom";
import PropTypes from "prop-types";

import { FetchContextProvider } from "./context";
import Routes from "./Routes";
import LogoutButton from "./LogoutButton";

const VuDLPrep = () => {
    return (
        <FetchContextProvider>
            <div className="logout">
                <LogoutButton />
            </div>
            <BrowserRouter>
                <Routes />
            </BrowserRouter>
        </FetchContextProvider>
    );
};

VuDLPrep.propTypes = {
    logoutUrl: PropTypes.string,
    token: PropTypes.string,
};

export default VuDLPrep;
