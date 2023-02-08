import React, { createContext, useContext, useReducer } from "react";

export enum ModalName {
    DatastreamModal = "datastream",
    ParentModal = "parents",
    StateModal = "state",
};

interface SnackbarState {
    open: boolean,
    message: string,
    severity: string
}

export enum ThemeOption {
    system = "system",
    light = "light",
    dark = "dark",
};

interface GlobalState {
    snackbarState: SnackbarState;
}

/**
 * Pass a shared entity to react components,
 * specifically a way to make api requests.
 */
const globalContextParams: GlobalState = {
    // Modal control
    openModalState: new Set(),
    // Snackbar
    snackbarState: {
        open: false,
        message: "",
        severity: "info",
    },
    // User theme
    userTheme: localLoadUserTheme(),
};

const reducerMapping: Record<string, string> = {
    // Snackbar
    SET_SNACKBAR_STATE: "snackbarState",
    // User theme
    SET_USER_THEME: "userTheme",
};

/**
 * Update the shared states of react components.
 */
const globalReducer = (state: GlobalState, { type, payload }: { type: string, payload: unknown}) => {
    if (type == "OPEN_MODAL") {
        state.openModalState.add(payload);
        return state;
    }
    if (type == "CLOSE_MODAL") {
        state.openModalState.remove(payload);
        return state;
    }

    if (Object.keys(reducerMapping).includes(type)){
        return {
            ...state,
            [reducerMapping[type]]: payload
        };
    } else {
        console.error(`global action type: ${type} does not exist`);
        return state;
    }
};

const GlobalContext = createContext({});

export const GlobalContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(globalReducer, globalContextParams);
    const value = { state, dispatch };
    return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => {
    const {
        state: {
            // Modal control
            openModalState,
            // Snackbar
            snackbarState,
            // User theme
            userTheme,
        },
        dispatch,
    } = useContext(GlobalContext);

    // Modal control

    const isModalOpen = (modal: ModalName) => {
        return openModalState.has(modal);
    };
    const openModal = (modal: ModalName) => {
        dispatch({
            type: "OPEN_MODAL",
            payload: modal
        });
    };
    const closeModal = (modal: ModalName) => {
        dispatch({
            type: "CLOSE_MODAL",
            payload: modal
        });
    };
    const toggleModal = (modal: ModalName) => {
        if (isModalOpen(modal)) {
            closeModal(modal);
        } else {
            openModal(modal);
        }
    };

    // Snackbar

    const setSnackbarState = (snackbarState: SnackbarState) => {
        dispatch({
            type: "SET_SNACKBAR_STATE",
            payload: snackbarState
        });
    };

    // User theme

    const setUserTheme = (userTheme: ThemeOption) => {
        localSaveUserTheme(userTheme);
        applyUserThemeToBody(userTheme);
        dispatch({
            type: "SET_USER_THEME",
            payload: userTheme,
        });
    };

    return {
        state: {
            // Snackbar
            snackbarState,
            // User theme
            userTheme,
        },
        action: {
            // Modal control
            isModalOpen,
            openModal,
            closeModal,
            toggleModal,
            // Snackbar
            setSnackbarState,
            // User theme
            setUserTheme,
        },
    };
}

export default {
    GlobalContextProvider,
    useGlobalContext
}

/* User Theme */

// Get system theme from CSS media queries
function systemTheme() {
    if (typeof window != "undefined") {
        if (window.matchMedia("(prefers-color-scheme)").mediaTheme == "not all") {
            return "light"
        }

        const isDark = !window.matchMedia("(prefers-color-scheme: light)").matches;
        return isDark ? "dark" : "light";
    }

    return "light";
}

function applyUserThemeToBody(userTheme) {
    if (typeof window != "undefined") {
        document.body.setAttribute(
            "color-scheme",
            userTheme == "system" ? systemTheme() : userTheme
        );
    }
}

// Get page theme from localStorage
function localSaveUserTheme(mediaTheme) {
    if (typeof window != "undefined") {
        localStorage.setItem("vudl-theme", mediaTheme);
    }
}

// Save page theme from localStorage
function localLoadUserTheme() {
    if (typeof window != "undefined") {
        let mediaTheme = localStorage.getItem("vudl-theme") ?? "system";

        applyUserThemeToBody(mediaTheme);

        return mediaTheme;
    }
}
