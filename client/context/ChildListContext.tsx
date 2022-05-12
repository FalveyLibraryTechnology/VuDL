import React, { createContext, useContext, useReducer } from "react";
import { getObjectChildrenUrl, getObjectDetailsUrl } from "../util/routes";
import { useFetchContext } from "./FetchContext";

interface ChildDetails {
};

interface Children {
    numFound?: number;
    start?: number;
    docs?: Record<string, string>[];
}

interface ChildListState {
    childDetailsStorage: Record<string, ChildDetails>;
    childListStorage: Record<string, Children>;
}

const childListContextParams: ChildListState = {
    childDetailsStorage: {},
    childListStorage: {},
};

const ChildListContext = createContext({});

const reducerMapping: Record<string, string> = {
};

/**
 * Update the shared states of react components.
 */
const childListReducer = (state: ChildListState, { type, payload }: { type: string, payload: unknown}) => {
    if (type === "ADD_TO_CHILD_DETAILS_STORAGE") {
        const { key, child } = payload;
        const childDetailsStorage = {
            ...state.childDetailsStorage,
        };
        childDetailsStorage[key] = child;
        return {
            ...state,
            childDetailsStorage
        };
    } else if (type === "ADD_TO_CHILD_LIST_STORAGE") {
        const { key, children } = payload;
        const childListStorage = {
            ...state.childListStorage,
        };
        childListStorage[key] = children;
        return {
            ...state,
            childListStorage
        };
    } else if (Object.keys(reducerMapping).includes(type)){
        return {
            ...state,
            [reducerMapping[type]]: payload
        };
    } else {
        console.error(`fetch action type: ${type} does not exist`);
        return state;
    }
};

export const ChildListContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(childListReducer, childListContextParams);
    const value = { state, dispatch };
    return <ChildListContext.Provider value={value}>{children}</ChildListContext.Provider>;
};

export const useChildListContext = () => {
    const {
        action: {
            fetchJSON
        }
    }= useFetchContext();
    const {
        state: {
            childDetailsStorage,
            childListStorage,
        },
        dispatch,
    } = useContext(ChildListContext);

    const addToChildDetailsStorage = (key: string, child: ChildDetails) => {
        dispatch({
            type: "ADD_TO_CHILD_DETAILS_STORAGE",
            payload: { key, child },
        });
    };

    const addToChildListStorage = (key: string, children: Children) => {
        dispatch({
            type: "ADD_TO_CHILD_LIST_STORAGE",
            payload: { key, children },
        });
    };

    const getChildListStorageKey = (pid: string, page: number, pageSize: number): string => {
        return `${pid}_${page}_${pageSize}`;
    };

    const loadChildDetailsIntoStorage = async (pid: string) => {
        const url = getObjectDetailsUrl(pid);
        try {
            addToChildDetailsStorage(pid, await fetchJSON(url));
        } catch (e) {
            console.error("Problem fetching details from " + url);
        }
    };

    const loadChildrenIntoStorage = async (pid: string, page: number, pageSize: number) => {
        const key = getChildListStorageKey(pid, page, pageSize);
        const url = getObjectChildrenUrl(pid, (page - 1) * pageSize, pageSize);
        try {
            addToChildListStorage(key, await fetchJSON(url));
        } catch (e) {
            console.error("Problem fetching tree data from " + url);
        }
    };

    return {
        state: {
            childDetailsStorage,
            childListStorage,
        },
        action: {
            getChildListStorageKey,
            loadChildDetailsIntoStorage,
            loadChildrenIntoStorage,
        },
    };
}

export default {
    ChildListContextProvider,
    useChildListContext
}