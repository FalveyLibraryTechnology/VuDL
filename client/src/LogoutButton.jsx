import React from "react";

import AjaxHelper from "./AjaxHelper";

export default function LogoutButton() {
    const ajax = AjaxHelper.getInstance();

    function clearToken() {
        sessionStorage.removeItem("token");
    }

    return (
        <a href={ajax.logoutUrl} className="button" onClick={clearToken}>
            Log Out
        </a>
    );
}
