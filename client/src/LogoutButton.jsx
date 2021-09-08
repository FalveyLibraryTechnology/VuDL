import React from "react";

import AjaxHelper from "./AjaxHelper";

const LogoutButton = () => {
    const ajax = AjaxHelper.getInstance();
    const clearToken = () => {
        sessionStorage.removeItem("token");
    };
    return (
        <a href={ajax.logoutUrl} className="button" onClick={clearToken}>
            Log Out
        </a>
    );
};

export default LogoutButton;
