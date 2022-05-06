import React, { createContext, useContext, useReducer } from "react";
import { getObjectChildrenUrl } from "../util/routes";
import { useFetchContext } from "./FetchContext";

interface Children {
    numFound?: number;
    start?: number;
    docs?: Record<string, string>[];
}

interface ChildListState {
    childStorage: Record<string, Children>;
}

const childListContextParams: ChildListState = {
    childStorage: {},
};

const ChildListContext = createContext({});

const reducerMapping: Record<string, string> = {
};

/**
 * Update the shared states of react components.
 */
const childListReducer = (state: ChildListState, { type, payload }: { type: string, payload: unknown}) => {
    if (type === "ADD_TO_CHILD_STORAGE") {
        const { key, children } = payload;
        const childStorage = {
            ...state.childStorage,
        };
        childStorage[key] = children;
        return {
            ...state,
            childStorage
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
            childStorage
        },
        dispatch,
    } = useContext(ChildListContext);

    const addToChildStorage = (key: string, children: Children) => {
        dispatch({
            type: "ADD_TO_CHILD_STORAGE",
            payload: { key, children },
        });
    };

    const getChildStorageKey = (pid: string, page: number, pageSize: number): string => {
        return `${pid}_${page}_${pageSize}`;
    }

    const loadChildrenIntoStorage = async (pid: string, page: number, pageSize: number) => {
        const key = getChildStorageKey(pid, page, pageSize);
        const url = getObjectChildrenUrl(pid, (page - 1) * pageSize, pageSize);
        try {
            addToChildStorage(key, await fetchJSON(url));
        } catch (e) {
            console.error("Problem fetching tree data from " + url);
        }
    }

    return {
        state: {
            childStorage,
        },
        action: {
            getChildStorageKey,
            loadChildrenIntoStorage,
        },
    };
}

export default {
    ChildListContextProvider,
    useChildListContext
}