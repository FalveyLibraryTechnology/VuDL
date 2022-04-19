import { useFetchContext } from "../context/FetchContext";
import { useEditorContext } from "../context/EditorContext";
import { deleteObjectDatastreamUrl, downloadObjectDatastreamUrl, postObjectDatastreamUrl } from "../util/routes";

const useDatastreamOperation = () => {
    const {
        action: { fetchBlob, fetchText },
    } = useFetchContext();
    const {
        state: { currentPid, activeDatastream, datastreamsCatalog },
        action: { setSnackbarState, toggleDatastreamModal, getCurrentModelsDatastreams },
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
            await getCurrentModelsDatastreams();
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

    const deleteDatastream = async () => {
        try {
            const text = await fetchText(deleteObjectDatastreamUrl(currentPid, activeDatastream), {
                method: "DELETE",
            });
            await getCurrentModelsDatastreams();
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

    return {
        uploadFile,
        deleteDatastream,
        downloadDatastream
    };
};

export default useDatastreamOperation;