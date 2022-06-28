import React, { createContext, useContext, useReducer } from "react";
import { editObjectCatalogUrl, getObjectChildrenUrl, getObjectDetailsUrl } from "../util/routes";
import { useFetchContext } from "./FetchContext";
import { extractFirstMetadataValue as utilExtractFirstMetadataValue } from "../util/metadata";

export interface ObjectDetails {
    fedoraDatastreams: Array<string>;
    metadata: Record<string, Array<string>>;
    models: Array<string>;
    pid: string;
    sortOn: string;
    state: string;
};

interface ChildrenResultPage {
    numFound?: number;
    start?: number;
    docs?: Record<string, string|string[]>[];
}

interface SnackbarState {
    open: boolean,
    message: string,
    severity: string
}

export interface FedoraDatastream {
    mimetype?: {
        allowedType: string;
        allowedSubtypes: string;
    };
}

export interface FedoraModel {
    datastreams?: Record<string, FedoraDatastream>;
}

export interface License {
    name: string;
    uri: string;
}

interface EditorState {
    modelsCatalog: Record<string, FedoraModel>;
    licensesCatalog: Record<string, License>;
    currentPid: string | null;
    activeDatastream: string | null;
    isDatastreamModalOpen: boolean;
    isStateModalOpen: boolean;
    datastreamModalState: string | null;
    stateModalActivePid: string | null;
    snackbarState: SnackbarState;
    objectDetailsStorage: Record<string, ObjectDetails>;
    childListStorage: Record<string, ChildrenResultPage>;
}

/**
 * Pass a shared entity to react components,
 * specifically a way to make api requests.
 */
const editorContextParams: EditorState = {
    modelsCatalog: {},
    licensesCatalog: {},
    currentPid: null,
    activeDatastream: null,
    isDatastreamModalOpen: false,
    isStateModalOpen: false,
    datastreamModalState: null,
    stateModalActivePid: null,
    snackbarState: {
        open: false,
        message: "",
        severity: "info"
    },
    objectDetailsStorage: {},
    childListStorage: {},
};

export const DatastreamModalStates = {
    UPLOAD: "Upload",
    VIEW: "View",
    METADATA: "Metadata",
    DOWNLOAD: "Download",
    DELETE: "Delete"
};


const EditorContext = createContext({});

const reducerMapping: Record<string, string> = {
    SET_LICENSES_CATALOG: "licensesCatalog",
    SET_MODELS_CATALOG: "modelsCatalog",
    SET_CURRENT_PID: "currentPid",
    SET_ACTIVE_DATASTREAM: "activeDatastream",
    SET_IS_DATASTREAM_MODAL_OPEN: "isDatastreamModalOpen",
    SET_IS_STATE_MODAL_OPEN: "isStateModalOpen",
    SET_DATASTREAM_MODAL_STATE: "datastreamModalState",
    SET_STATE_MODAL_ACTIVE_PID: "stateModalActivePid",
    SET_SNACKBAR_STATE: "snackbarState",
};

/**
 * Update the shared states of react components.
 */
const editorReducer = (state: EditorState, { type, payload }: { type: string, payload: SnackbarState | unknown}) => {
    if (type === "ADD_TO_OBJECT_DETAILS_STORAGE") {
        const { key, details } = payload as { key: string; details: ObjectDetails };
        const objectDetailsStorage = {
            ...state.objectDetailsStorage,
        };
        objectDetailsStorage[key] = details;
        return {
            ...state,
            objectDetailsStorage
        };
    } else if (type === "REMOVE_FROM_OBJECT_DETAILS_STORAGE") {
        const { key } = payload as { key: string };
        const objectDetailsStorage = {
            ...state.objectDetailsStorage,
        };
        delete objectDetailsStorage[key];
        return {
            ...state,
            objectDetailsStorage
        };
    } else if (type === "ADD_TO_CHILD_LIST_STORAGE") {
        const { key, children } = payload as { key: string; children: ChildrenResultPage };
        const childListStorage = {
            ...state.childListStorage,
        };
        childListStorage[key] = children;
        return {
            ...state,
            childListStorage
        };
    } else if(Object.keys(reducerMapping).includes(type)){
        return {
            ...state,
            [reducerMapping[type]]: payload
        };
    } else {
        console.error(`fetch action type: ${type} does not exist`);
        return state;
    }
};

export const EditorContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(editorReducer, editorContextParams);
    const value = { state, dispatch };
    return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditorContext = () => {
    const {
        action: {
            fetchJSON
        }
    }= useFetchContext();
    const {
        state: {
            currentPid,
            activeDatastream,
            isDatastreamModalOpen,
            isStateModalOpen,
            datastreamModalState,
            stateModalActivePid,
            licensesCatalog,
            modelsCatalog,
            snackbarState,
            objectDetailsStorage,
            childListStorage,
        },
        dispatch,
    } = useContext(EditorContext);

    const currentDatastreams = objectDetailsStorage?.[currentPid]?.datastreams ?? [];
    const currentModels = objectDetailsStorage?.[currentPid]?.models ?? [];
    const modelsDatastreams = currentModels.reduce((acc: Array<string>, model: string) => {
        const name = model.split(":")?.[1];
        return [
            ...acc,
            ...(name && modelsCatalog.hasOwnProperty(name) ? Object.keys(modelsCatalog[name].datastreams) : [])
        ];
    }, []).map((stream: string) => {
        return {
            disabled: !currentDatastreams.includes(stream),
            stream
        };
    });

    const addToObjectDetailsStorage = (key: string, details: ObjectDetails) => {
        console.log("add");
        dispatch({
            type: "ADD_TO_OBJECT_DETAILS_STORAGE",
            payload: { key, details },
        });
    };

    const removeFromObjectDetailsStorage = (key: string) => {
        console.log("remove");
        dispatch({
            type: "REMOVE_FROM_OBJECT_DETAILS_STORAGE",
            payload: { key },
        });
    };

    const addToChildListStorage = (key: string, children: ChildrenResultPage) => {
        dispatch({
            type: "ADD_TO_CHILD_LIST_STORAGE",
            payload: { key, children },
        });
    };

    const getChildListStorageKey = (pid: string, page: number, pageSize: number): string => {
        return `${pid}_${page}_${pageSize}`;
    };

    const loadObjectDetailsIntoStorage = async (pid: string) => {
        console.log("load");
        // Ignore null values:
        if (pid === null) {
            return;
        }
        const url = getObjectDetailsUrl(pid);
        try {
            addToObjectDetailsStorage(pid, await fetchJSON(url));
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

    const setModelsCatalog = (modelsCatalog: Record<string, FedoraModel>) => {
        dispatch({
            type: "SET_MODELS_CATALOG",
            payload: modelsCatalog
        });
    };

    const setLicensesCatalog = (licensesCatalog: Record<string, License>) => {
        dispatch({
            type: "SET_LICENSES_CATALOG",
            payload: licensesCatalog
        });
    };

    const setCurrentPid = (pid: string) => {
        dispatch({
            type: "SET_CURRENT_PID",
            payload: pid
        });
    };

    const toggleDatastreamModal = () => {
        dispatch({
            type: "SET_IS_DATASTREAM_MODAL_OPEN",
            payload: !isDatastreamModalOpen
        });
    };

    const toggleStateModal = () => {
        dispatch({
            type: "SET_IS_STATE_MODAL_OPEN",
            payload: !isStateModalOpen
        });
    };

    const setDatastreamModalState = (datastreamModalState: boolean) => {
        dispatch({
            type: "SET_DATASTREAM_MODAL_STATE",
            payload: datastreamModalState
        });
    };

    const setStateModalActivePid = (pid: string) => {
        dispatch({
            type: "SET_STATE_MODAL_ACTIVE_PID",
            payload: pid
        });
    };

    const setActiveDatastream = (datastream: string) => {
        dispatch({
            type: "SET_ACTIVE_DATASTREAM",
            payload: datastream
        })
    };

    const setSnackbarState = (snackbarState: SnackbarState) => {
        dispatch({
            type: "SET_SNACKBAR_STATE",
            payload: snackbarState
        });
    };

    const datastreamsCatalog = Object.values(modelsCatalog).reduce((acc: Record<string, FedoraDatastream>, model) => {
        return {
            ...acc,
            ...(model as FedoraModel).datastreams
        };
    }, {});

    const initializeCatalog = async () => {
        try {
            const response = await fetchJSON(editObjectCatalogUrl);
            setModelsCatalog(response.models || {});
            setLicensesCatalog(response.licenses || {});
        } catch(err) {
            console.error(`Problem fetching object catalog from ${editObjectCatalogUrl}`);
        }
    };

    const loadCurrentObjectDetails = async () => {
        return await loadObjectDetailsIntoStorage(currentPid);
    };

    const extractFirstMetadataValue = function (field: string, defaultValue: string): string {
        const currentMetadata = objectDetailsStorage?.[currentPid]?.metadata ?? {};
        return utilExtractFirstMetadataValue(currentMetadata, field, defaultValue);
    }

    return {
        state: {
            currentPid,
            currentDatastreams,
            activeDatastream,
            isDatastreamModalOpen,
            isStateModalOpen,
            datastreamModalState,
            stateModalActivePid,
            datastreamsCatalog,
            modelsDatastreams,
            modelsCatalog,
            licensesCatalog,
            snackbarState,
            objectDetailsStorage,
            childListStorage,
        },
        action: {
            initializeCatalog,
            setCurrentPid,
            loadCurrentObjectDetails,
            setActiveDatastream,
            setDatastreamModalState,
            setStateModalActivePid,
            toggleDatastreamModal,
            toggleStateModal,
            setSnackbarState,
            extractFirstMetadataValue,
            getChildListStorageKey,
            loadObjectDetailsIntoStorage,
            loadChildrenIntoStorage,
            removeFromObjectDetailsStorage,
        },
    };
}

export default {
    EditorContextProvider,
    DatastreamModalStates,
    useEditorContext
}