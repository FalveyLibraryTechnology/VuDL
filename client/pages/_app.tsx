/* eslint react/prop-types: 0 */
import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { GlobalContextProvider } from "../context/GlobalContext";
import { PaginatorContextProvider } from "../context/PaginatorContext";
import { FetchContextProvider } from "../context/FetchContext";

import LogoutButton from "../components/LogoutButton";

import "../styles/vendor/modern-normalize.css";
import "../styles/vendor/colors-radix.css";

import "../styles/reset.css";
import "../styles/variables.css";
import "../styles/global.css";
import "../styles/job-paginator.css";

function MyApp({ Component, pageProps }: { Component: React.ReactNode }): React.ReactElement {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? "dark" : "light",
                },
            }),
        [prefersDarkMode],
    );
    return (
        <GlobalContextProvider>
            <PaginatorContextProvider>
                <FetchContextProvider>
                    <ThemeProvider theme={theme}>
                        <LogoutButton />
                        <Component {...pageProps} />
                    </ThemeProvider>
                    <LogoutButton />
                    <Component {...pageProps} />
                </FetchContextProvider>
            </PaginatorContextProvider>
        </GlobalContextProvider>
    );
}
export default MyApp;
