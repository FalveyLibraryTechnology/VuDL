import React, { createContext, useContext, useReducer } from "react";
import { editObjectCatalogUrl, getObjectChildrenUrl, getObjectDetailsUrl } from "../util/routes";
import { useFetchContext } from "./FetchContext";
import { extractFirstMetadataValue as utilExtractFirstMetadataValue } from "../util/metadata";

interface ChildDetails {
};

interface Children {
    numFound?: number;
    start?: number;
    docs?: Record<string, string>[];
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
    currentMetadata: Record<string, Array<string>>;
    currentModels: Array<string>;
    currentDatastreams: Array<string>;
    activeDatastream: string | null;
    isDatastreamModalOpen: boolean;
    datastreamModalState: string | null;
    loading: boolean;
    snackbarState: SnackbarState;
    childDetailsStorage: Record<string, ChildDetails>;
    childListStorage: Record<string, Children>;
}

/**
 * Pass a shared entity to react components,
 * specifically a way to make api requests.
 */
const editorContextParams: EditorState = {
    modelsCatalog: {},
    licensesCatalog: {},
    currentPid: null,
    currentMetadata: {},
    currentModels: [],
    currentDatastreams: [],
    activeDatastream: null,
    isDatastreamModalOpen: false,
    datastreamModalState: null,
    loading: true,
    snackbarState: {
        open: false,
        message: "",
        severity: "info"
    },
    childDetailsStorage: {},
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
    SET_CURRENT_METADATA: "currentMetadata",
    SET_CURRENT_MODELS: "currentModels",
    SET_CURRENT_DATASTREAMS: "currentDatastreams",
    SET_ACTIVE_DATASTREAM: "activeDatastream",
    SET_IS_DATASTREAM_MODAL_OPEN: "isDatastreamModalOpen",
    SET_DATASTREAM_MODAL_STATE: "datastreamModalState",
    SET_SNACKBAR_STATE: "snackbarState",
    SET_LOADING: "loading"
};

/**
 * Update the shared states of react components.
 */
const editorReducer = (state: EditorState, { type, payload }: { type: string, payload: SnackbarState | unknown}) => {
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
            currentMetadata,
            currentModels,
            currentDatastreams,
            activeDatastream,
            isDatastreamModalOpen,
            datastreamModalState,
            licensesCatalog,
            modelsCatalog,
            loading,
            snackbarState,
            childDetailsStorage,
            childListStorage,
        },
        dispatch,
    } = useContext(EditorContext);

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
        // When we change the PID, we should flip to "loading..." status to prevent confusing displays:
        setLoading(true);
        dispatch({
            type: "SET_CURRENT_PID",
            payload: pid
        });
    };

    const setCurrentMetadata = (metadata: Record<string, Array<string>>) => {
        dispatch({
            type: "SET_CURRENT_METADATA",
            payload: metadata
        });
    };

    const setCurrentModels = (models: Array<string>) => {
        dispatch({
            type: "SET_CURRENT_MODELS",
            payload: models
        });
    };

    const setCurrentDatastreams = (datastreams: Array<string>) => {
        dispatch({
            type: "SET_CURRENT_DATASTREAMS",
            payload: datastreams
        });
    };

    const toggleDatastreamModal = () => {
        dispatch({
            type: "SET_IS_DATASTREAM_MODAL_OPEN",
            payload: !isDatastreamModalOpen
        });
    };

    const setDatastreamModalState = (datastreamModalState: boolean) => {
        dispatch({
            type: "SET_DATASTREAM_MODAL_STATE",
            payload: datastreamModalState
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

    const setLoading = (state: boolean) => {
        dispatch({
            type: "SET_LOADING",
            payload: state
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
    const loadObjectDetails = async (pid: string) => {
        try {
            setLoading(true);
            setCurrentPid(pid);
            const response = pid === null ?
                {} :
                (await fetchJSON(getObjectDetailsUrl(pid)));
            setCurrentMetadata(response.metadata || {});
            setCurrentModels(response.models || []);
            setCurrentDatastreams(response.datastreams || []);
            setLoading(false);
        } catch(err) {
            console.error("Problem fetching object details from " + getObjectDetailsUrl(pid));
        }
    };

    const loadCurrentObjectDetails = async () => {
        return await loadObjectDetails(currentPid);
    };

    const extractFirstMetadataValue = function (field: string, defaultValue: string): string {
        return utilExtractFirstMetadataValue(currentMetadata, field, defaultValue);
    }

    return {
        state: {
            currentPid,
            currentDatastreams,
            activeDatastream,
            isDatastreamModalOpen,
            datastreamModalState,
            datastreamsCatalog,
            modelsDatastreams,
            modelsCatalog,
            licensesCatalog,
            loading,
            snackbarState,
            childDetailsStorage,
            childListStorage,
        },
        action: {
            initializeCatalog,
            setCurrentPid,
            loadObjectDetails,
            loadCurrentObjectDetails,
            setActiveDatastream,
            setDatastreamModalState,
            toggleDatastreamModal,
            setSnackbarState,
            extractFirstMetadataValue,
            getChildListStorageKey,
            loadChildDetailsIntoStorage,
            loadChildrenIntoStorage,
        },
    };
}

export default {
    EditorContextProvider,
    DatastreamModalStates,
    useEditorContext
}