import React, { createContext, useContext, useReducer } from "react";
import { editObjectCatalogUrl, getObjectModelsDatastreamsUrl } from "../util/routes";
import { useFetchContext } from "./FetchContext";

/**
 * Pass a shared entity to react components,
 * specifically a way to make api requests.
 */
const editorContextParams = {
    modelsCatalog: {},
    currentPid: null,
    currentModels: [],
    currentDatastreams: [],
    activeDatastream: null,
    isDatastreamModalOpen: false,
    datastreamModalState: null,
    snackbarState: {
        open: false,
        message: "",
        severity: "info"
    }
};

export const DatastreamModalStates = {
    UPLOAD: "Upload",
    // VIEW: "View",
    // METADATA: "Metadata",
    // DOWNLOAD: "Download",
    DELETE: "Delete"
};


const EditorContext = createContext({});

const reducerMapping = {
    SET_MODELS_CATALOG: "modelsCatalog",
    SET_CURRENT_PID: "currentPid",
    SET_CURRENT_MODELS: "currentModels",
    SET_CURRENT_DATASTREAMS: "currentDatastreams",
    SET_ACTIVE_DATASTREAM: "activeDatastream",
    SET_IS_DATASTREAM_MODAL_OPEN: "isDatastreamModalOpen",
    SET_DATASTREAM_MODAL_STATE: "datastreamModalState",
    SET_SNACKBAR_STATE: "snackbarState"
};
/**
 * Update the shared states of react components.
 */
const editorReducer = (state, { type, payload }) => {
    if(Object.keys(reducerMapping).includes(type)){
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
            currentModels,
            currentDatastreams,
            activeDatastream,
            isDatastreamModalOpen,
            datastreamModalState,
            modelsCatalog,
            snackbarState
        },
        dispatch,
    } = useContext(EditorContext);

    const modelsDatastreams = currentModels.reduce((acc, model) => {
        const name = model.split(":")?.[1];
        return [
            ...acc,
            ...(name ? Object.keys(modelsCatalog[name].datastreams) : [])
        ];
    }, []).map((stream) => {
        return {
            disabled: !currentDatastreams.includes(stream),
            stream
        };
    });


    const setModelsCatalog = (modelsCatalog) => {
        dispatch({
            type: "SET_MODELS_CATALOG",
            payload: modelsCatalog
        });
    };

    const setCurrentPid = (pid) => {
        dispatch({
            type: "SET_CURRENT_PID",
            payload: pid
        });
    };

    const setCurrentModels = (models) => {
        dispatch({
            type: "SET_CURRENT_MODELS",
            payload: models
        });
    };

    const setCurrentDatastreams = (datastreams) => {
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

    const setDatastreamModalState = (datastreamModalState) => {
        dispatch({
            type: "SET_DATASTREAM_MODAL_STATE",
            payload: datastreamModalState
        });
    };

    const setActiveDatastream = (datastream) => {
        dispatch({
            type: "SET_ACTIVE_DATASTREAM",
            payload: datastream
        })
    };

    const setSnackbarState = (snackbarState) => {
        dispatch({
            type: "SET_SNACKBAR_STATE",
            payload: snackbarState
        });
    };

    const datastreamsCatalog = Object.values(modelsCatalog).reduce((acc, model) => {
        return {
            ...acc,
            ...model.datastreams
        };
    }, {});

    const initializeModelsCatalog = async () => {
        try {
            const response = await fetchJSON(editObjectCatalogUrl);
            setModelsCatalog(response.models || {});
        } catch(err) {
            console.error(`Problem fetching object catalog from ${editObjectCatalogUrl}`);
        }
    };
    const getCurrentModelsDatastreams = async () => {
        try {
            const response = currentPid === null ?
                {} :
                (await fetchJSON(getObjectModelsDatastreamsUrl(currentPid)));
            setCurrentModels(response.models || []);
            setCurrentDatastreams(response.datastreams || []);
        } catch(err) {
            console.error("Problem fetching object models and datastreams from " + getObjectModelsDatastreamsUrl(currentPid));
        }
    };

    return {
        state: {
            currentPid,
            activeDatastream,
            isDatastreamModalOpen,
            datastreamModalState,
            datastreamsCatalog,
            modelsDatastreams,
            snackbarState
        },
        action: {
            initializeModelsCatalog,
            setCurrentPid,
            getCurrentModelsDatastreams,
            setActiveDatastream,
            setDatastreamModalState,
            toggleDatastreamModal,
            setSnackbarState
        },
    };
}

export default {
    EditorContextProvider,
    DatastreamModalStates,
    useEditorContext
}