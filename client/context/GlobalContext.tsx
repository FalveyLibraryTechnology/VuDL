import React, { createContext, useContext, useReducer } from "react";

interface SnackbarState {
    open: boolean,
    message: string,
    severity: string
}

interface GlobalState {
    snackbarState: SnackbarState;
}

/**
 * Pass a shared entity to react components,
 * specifically a way to make api requests.
 */
const globalContextParams: GlobalState = {
    snackbarState: {
        open: false,
        message: "",
        severity: "info",
    },
};

const reducerMapping: Record<string, string> = {
    SET_SNACKBAR_STATE: "snackbarState",
};

/**
 * Update the shared states of react components.
 */
const globalReducer = (state: GlobalState, { type, payload }: { type: string, payload: unknown}) => {
    if(Object.keys(reducerMapping).includes(type)){
        console.log(type, payload);

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
            snackbarState,
        },
        dispatch,
    } = useContext(GlobalContext);

    const setSnackbarState = (snackbarState: SnackbarState) => {
        dispatch({
            type: "SET_SNACKBAR_STATE",
            payload: snackbarState
        });
    };

    return {
        state: {
            snackbarState,
        },
        action: {
            setSnackbarState,
        },
    };
}

export default {
    GlobalContextProvider,
    useGlobalContext
}
