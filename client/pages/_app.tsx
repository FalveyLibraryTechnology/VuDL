import React from "react";
import { GlobalContextProvider } from "../context/GlobalContext";
import { PaginatorContextProvider } from "../context/PaginatorContext";
import { FetchContextProvider } from "../context/FetchContext";

import LogoutButton from "../components/LogoutButton";

import "../styles/vendor/modern-normalize.css";
import "../styles/vendor/colors-radix-light.css";

import "../styles/reset.css";
import "../styles/variables.css";
import "../styles/global.css";
import "../styles/job-paginator.css";

function MyApp({ Component, pageProps }: { Component: React.ReactNode }): React.ReactElement {
    return (
        <GlobalContextProvider>
            <PaginatorContextProvider>
                <FetchContextProvider>
                    <LogoutButton />
                    <Component {...pageProps} />
                </FetchContextProvider>
            </PaginatorContextProvider>
        </GlobalContextProvider>
    );
}
export default MyApp;
