import React, { createContext, useContext, useReducer } from "react";
import PropTypes from "prop-types";

const ProcessMetadataContext = createContext({});

export interface ProcessMetadataTask {
    description?: string;
    id?: string;
    individual?: string;
    label?: string;
    sequence?: string;
    toolDescription?: string;
    toolLabel?: string;
    toolMake?: string;
    toolSerialNumber?: string;
    toolVersion?: string;
}

export interface ProcessMetadata {
    processCreator?: string;
    processDateTime?: string;
    processLabel?: string;
    processOrganization?: string;
    tasks?: Array<ProcessMetadataTask>;
}

/**
 * Update the shared states of react components.
 */
const reducerMapping: Record<string, string> = {
    UPDATE_PROCESS_CREATOR: "processCreator",
    UPDATE_PROCESS_DATE_TIME: "processDateTime",
    UPDATE_PROCESS_LABEL: "processLabel",
    UPDATE_PROCESS_ORGANIZATION: "processOrganization",
};
const processMetadataReducer = (state, { type, payload }) => {
    if (type === "UPDATE_METADATA") {
        return payload;
    } else if(Object.keys(reducerMapping).includes(type)) {
        return {
            ...state,
            [reducerMapping[type]]: payload
        };
    }
    console.error(`processMetadata action type: ${type} does not exist`);
    return state;
};

export const ProcessMetadataContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(processMetadataReducer, {});
    const value = { state, dispatch };
    return <ProcessMetadataContext.Provider value={value}>{children}</ProcessMetadataContext.Provider>;
};

export const useProcessMetadataContext = () => {
    const {
        state,
        dispatch,
    } = useContext(ProcessMetadataContext) as { state: ProcessMetadata, dispatch: (params: unknown) => void };

    const setMetadata = (metadata: ProcessMetadata): void => {
        dispatch({
            type: "UPDATE_METADATA",
            payload: metadata
        });
    };

    const setProcessCreator = (value: string): void => {
        dispatch({
            type: "UPDATE_PROCESS_CREATOR",
            payload: value
        });
    };

    const setProcessDateTime = (value: string): void => {
        dispatch({
            type: "UPDATE_PROCESS_DATE_TIME",
            payload: value
        });
    };

    const setProcessLabel = (value: string): void => {
        dispatch({
            type: "UPDATE_PROCESS_LABEL",
            payload: value
        });
    };

    const setProcessOrganization = (value: string): void => {
        dispatch({
            type: "UPDATE_PROCESS_ORGANIZATION",
            payload: value
        });
    };

    return {
        state,
        action: {
            setMetadata,
            setProcessCreator,
            setProcessDateTime,
            setProcessLabel,
            setProcessOrganization,
        },
    };
};

ProcessMetadataContextProvider.propTypes = {
    children: PropTypes.node,
};

export default { ProcessMetadataContextProvider, useProcessMetadataContext };
