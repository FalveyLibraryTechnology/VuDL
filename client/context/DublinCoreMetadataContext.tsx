import React, { createContext, useContext, useReducer } from "react";
import PropTypes from "prop-types";

export interface DublinCoreMetadata {
    currentDublinCore: Record<string, Array<string>>;
    // We need to be careful about how we set keys for elements in our control group; if we reuse
    // keys after changing components, then when we add or remove values in the list, React may
    // inappropriately reuse existing elements instead of correctly redrawing the modified list.
    // By maintaining a counter of the number of times impactful changes are made in the list, we
    // can ensure that keys are always unique, and that elements are redrawn when necessary.
    // This feels like a hack, and a better solution would be welcomed!
    keyCounter: Record<string, number>;
}

const dublinCoreContextParams: DublinCoreMetadata = { currentDublinCore: {}, keyCounter: {} };
const DublinCoreMetadataContext = createContext({});

/**
 * Update the shared states of react components.
 */
const reducerMapping: Record<string, string> = {
    SET_CURRENT_DUBLIN_CORE: "currentDublinCore",
};

const incrementKeyCounter = (keyCounter: Record<string, number>, field: string): Record<string, number> => {
    const current = keyCounter[field] ?? 0;
    return {
        ...keyCounter,
        [field]: current + 1,
    };
};

const addAbove = (dublinCore: Record<string, Array<string>>, field: string, index: number, value: string): Record<string, Array<string>> => {
    const current = (dublinCore[field] ?? []).slice(0);
    current.splice(index, 0, value);
    return {
        ...dublinCore,
        [field]: current,
    }
};

const addBelow = (dublinCore: Record<string, Array<string>>, field: string, index: number, value: string): Record<string, Array<string>> => {
    const current = (dublinCore[field] ?? []).slice(0);
    current.splice(index + 1, 0, value);
    return {
        ...dublinCore,
        [field]: current,
    }
};

const deleteValue = (dublinCore: Record<string, Array<string>>, field: string, index: number): Record<string, Array<string>> => {
    const current = (dublinCore[field] ?? []).slice(0);
    current.splice(index, 1);
    return {
        ...dublinCore,
        [field]: current,
    }
};

const replaceValue = (dublinCore: Record<string, Array<string>>, field: string, index: number, value: string): Record<string, Array<string>> => {
    const current = (dublinCore[field] ?? []).slice(0);
    current[index] = value;
    return {
        ...dublinCore,
        [field]: current,
    }
};

const dublinCoreMetadataReducer = (state: DublinCoreMetadata, { type, payload }: { type: string, payload: unknown }) => {
    if (type === "ADD_VALUE_ABOVE") {
        const { field, index, value } = payload as { field: string, index: number, value: string };
        return {
            ...state,
            keyCounter: incrementKeyCounter(state.keyCounter, field),
            currentDublinCore: addAbove(state.currentDublinCore, field, index, value),
        }
    } else if (type === "ADD_VALUE_BELOW") {
        const { field, index, value } = payload as { field: string, index: number, value: string };
        return {
            ...state,
            keyCounter: incrementKeyCounter(state.keyCounter, field),
            currentDublinCore: addBelow(state.currentDublinCore, field, index, value),
        }
    } else if (type === "DELETE_VALUE") {
        const { field, index } = payload as { field: string, index: number };
        return {
            ...state,
            keyCounter: incrementKeyCounter(state.keyCounter, field),
            currentDublinCore: deleteValue(state.currentDublinCore, field, index),
        }
    } else if (type === "REPLACE_VALUE") {
        const { field, index, value } = payload as { field: string, index: number, value: string };
        return {
            ...state,
            // We don't need to refresh the key counter in this scenario, because the number of
            // fields is not changing.
            currentDublinCore: replaceValue(state.currentDublinCore, field, index, value),
        }
    } else if(Object.keys(reducerMapping).includes(type)) {
        return {
            ...state,
            [reducerMapping[type]]: payload
        };
    }
    console.error(`processMetadata action type: ${type} does not exist`);
    return state;
};

export const DublinCoreMetadataContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(dublinCoreMetadataReducer, dublinCoreContextParams);
    const value = { state, dispatch };
    return <DublinCoreMetadataContext.Provider value={value}>{children}</DublinCoreMetadataContext.Provider>;
};

export const useDublinCoreMetadataContext = () => {
    const {
        state,
        dispatch,
    } = useContext(DublinCoreMetadataContext) as { state: DublinCoreMetadata, dispatch: (params: unknown) => void };

    const setCurrentDublinCore = (dc: Record<string, Array<string>>) => {
        dispatch({
            type: "SET_CURRENT_DUBLIN_CORE",
            payload: dc
        });
    };

    const addValueAbove = (field: string, index: number, value: string): void => {
        dispatch({
            type: "ADD_VALUE_ABOVE",
            payload: { field, index, value }
        });
    }

    const addValueBelow = (field: string, index: number, value: string): void => {
        dispatch({
            type: "ADD_VALUE_BELOW",
            payload: { field, index, value }
        });
    }

    const deleteValue = (field: string, index: number): void => {
        dispatch({
            type: "DELETE_VALUE",
            payload: { field, index }
        });
    }

    const replaceValue = (field: string, index: number, value: string): void => {
        dispatch({
            type: "REPLACE_VALUE",
            payload: { field, index, value }
        });
    }

    return {
        state,
        action: {
            addValueAbove,
            addValueBelow,
            deleteValue,
            replaceValue,
            setCurrentDublinCore,
        },
    };
};

DublinCoreMetadataContextProvider.propTypes = {
    children: PropTypes.node,
};

export default { DublinCoreMetadataContextProvider, useDublinCoreMetadataContext };
