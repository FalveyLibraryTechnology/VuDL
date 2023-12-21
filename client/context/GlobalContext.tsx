import React, { createContext, useContext, useReducer } from "react";

interface SnackbarState {
    open: boolean,
    message: string,
    severity: string
}

interface GlobalState {
    // Modal control
    modalOpenStates: Record<string, boolean>;
    // Snackbar
    snackbarState: SnackbarState;
}

/**
 * Pass a shared entity to react components,
 * specifically a way to make api requests.
 */
const globalContextParams: GlobalState = {
    // Modal control
    modalOpenStates: {},
    // Snackbar
    snackbarState: {
        open: false,
        message: "",
        severity: "info",
    },
};

const reducerMapping: Record<string, string> = {
    // Snackbar
    SET_SNACKBAR_STATE: "snackbarState",
};

/**
 * Update the shared states of react components.
 */
const globalReducer = (state: GlobalState, { type, payload }: { type: string, payload: unknown}) => {
    function updateModalInState(payload, isOpen) {
        const modalOpenStates = {
            ...state.modalOpenStates,
            [payload]: isOpen,
        };
        return {
            ...state,
            modalOpenStates,
        };
    }
    if (type == "OPEN_MODAL") {
        return updateModalInState(payload, true);
    }
    if (type == "CLOSE_MODAL") {
        return updateModalInState(payload, false);
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
            modalOpenStates,
            // Snackbar
            snackbarState,
        },
        dispatch,
    } = useContext(GlobalContext);

    // Modal control

    const isModalOpen = (modal: string) => modalOpenStates[modal] ?? false;
    const openModal = (modal: string) => {
        dispatch({
            type: "OPEN_MODAL",
            payload: modal
        });
    };
    const closeModal = (modal: string) => {
        dispatch({
            type: "CLOSE_MODAL",
            payload: modal
        });
    };
    const toggleModal = (modal: string) => {
        if (modalOpenStates[modal] ?? false) {
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

    return {
        state: {
            // Snackbar
            snackbarState,
        },
        action: {
            // Modal control
            isModalOpen,
            openModal,
            closeModal,
            toggleModal,
            // Snackbar
            setSnackbarState,
        },
    };
}

export default {
    GlobalContextProvider,
    useGlobalContext
}