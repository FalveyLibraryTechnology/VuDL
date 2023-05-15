import React, { useState } from "react";
import { useEditorContext } from "../../context/EditorContext";
import { getObjectDirectChildPidsUrl, getObjectSortOnUrl, getPositionInParentUrl } from "../../util/routes";
import { useFetchContext } from "../../context/FetchContext";

export interface ObjectOrderProps {
    pid: string;
}

const ObjectOrder = ({ pid }: ObjectOrderProps): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
        action: { clearPidFromChildListStorage, removeFromObjectDetailsStorage },
    } = useEditorContext();
    const {
        action: { fetchJSON, fetchText },
    } = useFetchContext();
    const [statusMessage, setStatusMessage] = useState<string>("");
    const currentSort = objectDetailsStorage?.[pid]?.sortOn ?? "title";
    const childPageSize = 1000;
    const solrSort = "title_sort ASC,id ASC";
    const changeSort = async (sort: string) => {
        if (!confirm("Are you sure you want to change the sort?")) {
            return;
        }
        setStatusMessage("Saving...");
        let offset = 0;
        let response = null;
        let result = "";
        let currentStatus = "";
        currentStatus = `Changing ${pid} sort to ${sort}`;
        setStatusMessage(currentStatus);
        const sortResult = await fetchText(getObjectSortOnUrl(pid), { method: "PUT", body: sort });
        if (sortResult != "ok") {
            setStatusMessage(`${currentStatus} -- unexpected error`);
            return;
        }
        let errorOccurred = false;
        do {
            const url = getObjectDirectChildPidsUrl(pid, offset, childPageSize, solrSort);
            response = await fetchJSON(url);
            for (const x in response.docs ?? []) {
                const targetPid = response.docs[x].id;
                const positionUrl = getPositionInParentUrl(targetPid, pid);
                if (sort === "custom") {
                    const newPosition = offset + parseInt(x) + 1;
                    currentStatus = `Setting ${targetPid} to position ${newPosition}`;
                    setStatusMessage(currentStatus);
                    result = await fetchText(positionUrl, { method: "PUT", body: newPosition });
                } else {
                    currentStatus = `Clearing order for ${targetPid}`;
                    setStatusMessage(currentStatus);
                    result = await fetchText(positionUrl, { method: "DELETE" });
                }
                if (result != "ok") {
                    setStatusMessage(`${currentStatus} -- unexpected error`);
                    errorOccurred = true;
                    break;
                }
                removeFromObjectDetailsStorage(targetPid);
            }
            offset += childPageSize;
        } while (!errorOccurred && offset < (response.numFound ?? 0));
        if (!errorOccurred) {
            setStatusMessage("");
        }
        removeFromObjectDetailsStorage(pid);
        clearPidFromChildListStorage(pid);
    };
    const otherSort = currentSort === "title" ? "custom" : "title";
    return statusMessage.length > 0 ? (
        <div>{statusMessage}</div>
    ) : (
        <div>
            Current sort: {currentSort}
            <button
                onClick={() => {
                    changeSort(otherSort);
                }}
            >
                Change to {otherSort}
            </button>
        </div>
    );
};

export default ObjectOrder;
