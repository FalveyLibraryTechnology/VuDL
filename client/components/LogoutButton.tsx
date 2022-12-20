import React from "react";

import { logoutUrl } from "../util/routes";

const LogoutButton = (): React.ReactElement => {
    const clearToken = () => {
        sessionStorage.removeItem("token");
    };
    return (
        <a href={logoutUrl} className="button" onClick={clearToken}>
            Log Out
        </a>
    );
};

export default LogoutButton;
