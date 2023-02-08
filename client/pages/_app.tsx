/* eslint react/prop-types: 0 */
import React from "react";
import { GlobalContextProvider } from "../context/GlobalContext";
import { PaginatorContextProvider } from "../context/PaginatorContext";
import { FetchContextProvider } from "../context/FetchContext";

import "../styles/normalize.css";
import "../styles/application.css";
import "../styles/client.css";
import "../styles/justgrid.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import LogoutButton from "../components/LogoutButton";
import ThemeMenu from "../components/ThemeMenu";

function MyApp({ Component, pageProps }: { Component: React.ReactNode }): React.ReactElement {
    return (
        <GlobalContextProvider>
            <div className="nav--right">
                <ThemeMenu />
                <div className="logout">
                    <LogoutButton />
                </div>
            </div>

            <PaginatorContextProvider>
                <FetchContextProvider>
                    <Component {...pageProps} />
                </FetchContextProvider>
            </PaginatorContextProvider>
        </GlobalContextProvider>
    );
}
export default MyApp;
