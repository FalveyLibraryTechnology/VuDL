/* eslint react/prop-types: 0 */
import React from "react";
import { PaginatorContextProvider } from "../context/PaginatorContext";
import { FetchContextProvider } from "../context/FetchContext";

import "../styles/normalize.css";
import "../styles/application.css";
import "../styles/client.css";
import "../styles/justgrid.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import LogoutButton from "../components/LogoutButton";

function MyApp({ Component, pageProps }: { Component: React.ReactNode }): React.ReactElement {
    return (
        <PaginatorContextProvider>
            <div className="logout">
                <LogoutButton />
            </div>
            <FetchContextProvider>
                <Component {...pageProps} />
            </FetchContextProvider>
        </PaginatorContextProvider>
    );
}
export default MyApp;