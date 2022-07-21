import { useFetchContext } from "../context/FetchContext";
import { useEditorContext } from "../context/EditorContext";
import {
    deleteObjectDatastreamUrl,
    downloadObjectDatastreamUrl,
    getObjectDatastreamMimetypeUrl,
    objectDatastreamLicenseUrl,
    postObjectDatastreamUrl,
    viewObjectDatastreamUrl,
    getObjectDatastreamMetadataUrl,
    objectDatastreamAgentsUrl
 } from "../util/routes";

const useDatastreamOperation = () => {
    const {
        action: { fetchBlob, fetchJSON, fetchText },
    } = useFetchContext();
    const {
        state: { currentPid, activeDatastream, datastreamsCatalog, currentDatastreams },
        action: { setSnackbarState, toggleDatastreamModal, loadCurrentObjectDetails },
    } = useEditorContext();

    const isAllowedMimeType = (mimeType) => {
        if (!datastreamsCatalog[activeDatastream]) {
            return false;
        }
        const [type, subtype] = mimeType.split("/");
        const { allowedType, allowedSubtypes } = datastreamsCatalog[activeDatastream].mimetype;
        return (
            (allowedType.includes(type) || allowedType.includes("*")) &&
            (allowedSubtypes.includes(subtype) || allowedSubtypes.includes("*"))
        );
    };

    const uploadFile = async (file) => {
        try {
            if (!isAllowedMimeType(file.type)) {
                throw new Error(`Illegal mime type: ${file.type}`);
            }
            const body = new FormData();
            body.append("file", file);
            const text = await fetchText(postObjectDatastreamUrl(currentPid, activeDatastream), {
                method: "POST",
                body,
            });
            await loadCurrentObjectDetails();
            setSnackbarState({
                open: true,
                message: text,
                severity: "success",
            });
            toggleDatastreamModal();
        } catch (err) {
            setSnackbarState({
                open: true,
                message: err.message,
                severity: "error",
            });
            toggleDatastreamModal();
        }
    };

    const uploadAgents = async (agents) => {
        try {
            const text = await fetchText(objectDatastreamAgentsUrl(currentPid, activeDatastream), {
                method: "POST",
                body: JSON.stringify({
                    agents
                })
            }, { "Content-Type": "application/json" });
            await loadCurrentObjectDetails();
            setSnackbarState({
                open: true,
                message: text,
                severity: "success",
            });
        } catch (err) {
            setSnackbarState({
                open: true,
                message: err.message,
                severity: "error",
            });
        }
    };

    const uploadLicense = async (licenseKey) => {
        try {
            const text = await fetchText(objectDatastreamLicenseUrl(currentPid, activeDatastream), {
                method: "POST",
                body: JSON.stringify({
                    licenseKey
                })
            }, { "Content-Type": "application/json" });
            await loadCurrentObjectDetails();
            setSnackbarState({
                open: true,
                message: text,
                severity: "success",
            });
        } catch (err) {
            setSnackbarState({
                open: true,
                message: err.message,
                severity: "error",
            });
        }
        toggleDatastreamModal();
    };

    const deleteDatastream = async () => {
        try {
            const text = await fetchText(deleteObjectDatastreamUrl(currentPid, activeDatastream), {
                method: "DELETE",
            });
            await loadCurrentObjectDetails();
            setSnackbarState({
                open: true,
                message: text,
                severity: "success",
            });
        } catch (err) {
            setSnackbarState({
                open: true,
                message: err.message,
                severity: "error",
            });
        }
        toggleDatastreamModal();
    };

    const downloadDatastream = async (datastream) => {
        try {
            const response = await fetchBlob(downloadObjectDatastreamUrl(currentPid, datastream));
            const fileName = response?.headers?.get("Content-Disposition")?.split('filename=')?.[1]?.split(';')?.[0];
            if(!fileName || !response?.blob) {
                throw new Error("Incorrect file format");
            }
            const link = document.createElement("a");
            link.href = URL.createObjectURL(response?.blob);
            link.setAttribute("download", `${fileName}`);
            document.body.appendChild(link);
            link.click();
        } catch(err) {
            setSnackbarState({
                open: true,
                message: err.message,
                severity: "error",
            });
        }
    };

    const viewDatastream = async (): Promise<{ data: string; mimeType: string; }> => {
        try {
            const response =  await fetchBlob(viewObjectDatastreamUrl(currentPid, activeDatastream));
            const mimeType: string = response?.headers?.get("Content-Type").split(";")[0];
            const data = mimeType.match(/text\/[-+.\w]+/)
                ? await response.blob.text()
                : URL.createObjectURL(response?.blob);
            return {
                data,
                mimeType: /audio\/x-flac/.test(mimeType)? "audio/flac" : mimeType
            };
        } catch(err) {
            setSnackbarState({
                open: true,
                message: err.message,
                severity: "error",
            });
        }
        return {
            data: "",
            mimeType: ""
        }
    };

    const viewMetadata = async (): Promise<{ data: string; mimeType: string; }> => {
        try {
            const data =  await fetchText(getObjectDatastreamMetadataUrl(currentPid, activeDatastream));
            return {
                data,
                mimeType: "text/xml"
            };
        } catch(err) {
            setSnackbarState({
                open: true,
                message: err.message,
                severity: "error",
            });
        }
        return {
            data: "",
            mimeType: ""
        }
    };

    const getDatastreamMimetype = async (datastream: string):Promise<string> => {
        try {
            return (await fetchText(getObjectDatastreamMimetypeUrl(currentPid, datastream))).split(";")[0];
        } catch(err) {
            setSnackbarState({
                open: true,
                message: err.message,
                severity: "error",
            });
        }
        return  "";
    };

    const getLicenseKey = async (): Promise<string> => {
        if(currentDatastreams.includes(activeDatastream)) {
            try {
                return await fetchText(objectDatastreamLicenseUrl(currentPid, activeDatastream));
            } catch(err) {
                setSnackbarState({
                    open: true,
                    message: err.message,
                    severity: "error",
                });
            }
        }
        return  "";
    };
    const getAgents = async (): Promise<Array<object>> => {
        if(currentDatastreams.includes(activeDatastream)) {
            try {
                return await fetchJSON(objectDatastreamAgentsUrl(currentPid, activeDatastream));
            } catch(err) {
                setSnackbarState({
                    open: true,
                    message: err.message,
                    severity: "error",
                });
            }
        }
        return  [];
    };
    return {
        uploadAgents,
        uploadFile,
        uploadLicense,
        deleteDatastream,
        downloadDatastream,
        viewDatastream,
        viewMetadata,
        getDatastreamMimetype,
        getLicenseKey,
        getAgents
    };
};

export default useDatastreamOperation;