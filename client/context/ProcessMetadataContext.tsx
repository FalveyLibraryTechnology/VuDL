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
const resynchronizeTaskIds = (tasks: Array<ProcessMetadataTask>): Array<ProcessMetadataTask> => {
    return tasks.map((task: ProcessMetadataTask, i: string) => {
        task.id = "" + (parseInt(i) + 1);
        return task;
    });
}

const processMetadataReducer = (state: ProcessMetadata, { type, payload }: { type: string, payload: unknown }) => {
    if (type === "UPDATE_METADATA") {
        return payload;
    } else if (type === "UPDATE_TASK_ATTRIBUTE") {
        const { index, attribute, value } = payload as { index: number, attribute: string, value: string};
        const tasks = (state.tasks ?? []).map((task, i) => {
            if (i === index) {
                return {
                    ...task,
                    [attribute]: value
                };
            }
            return task;
        });
        return {
            ...state,
            tasks
        };
    } else if (type === "ADD_TASK") {
        const index = payload as number;
        const newTask = {
            description: "",
            id: "",
            individual: "",
            label: "",
            sequence: "" + (index + 1),
            toolDescription: "",
            toolLabel: "",
            toolMake: "",
            toolSerialNumber: "",
            toolVersion: "",
        };
        const tasks = [...(state.tasks ?? [])];
        tasks.splice(index, 0, newTask);
        return {
            ...state,
            tasks: resynchronizeTaskIds(tasks),
        };
    } else if (type === "DELETE_TASK") {
        const index = payload as number;
        return {
            ...state,
            tasks: resynchronizeTaskIds((state.tasks ?? []).filter((task, i) => i !== index)),
        };
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

    const addTask = (index: number): void => {
        dispatch({
            type: "ADD_TASK",
            payload: index
        });
    }

    const deleteTask = (index: number): void => {
        dispatch({
            type: "DELETE_TASK",
            payload: index
        });
    }

    const updateTaskAttribute = (index: number, attribute: string, value: string): void => {
        dispatch({
            type: "UPDATE_TASK_ATTRIBUTE",
            payload: { index, attribute, value }
        });
    }

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

    const setProcessDateTime = (value: string | null): void => {
        dispatch({
            type: "UPDATE_PROCESS_DATE_TIME",
            payload: value ?? ""
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
            addTask,
            deleteTask,
            updateTaskAttribute,
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
