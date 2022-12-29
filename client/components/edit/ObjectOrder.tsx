import React, { useState } from "react";
import { useEditorContext } from "../../context/EditorContext";
import { getObjectDirectChildPidsUrl } from "../../util/routes";
import { useFetchContext } from "../../context/FetchContext";
import ObjectStatus from "./ObjectStatus";
import Refresh from "@mui/icons-material/Refresh";
import EditParentsButton from "./EditParentsButton";

export interface ObjectOrderProps {
    pid: string;
}

const ObjectOrder = ({ pid }: ObjectOrderProps): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
        action: { clearPidFromChildListStorage },
    } = useEditorContext();
    const {
        action: { fetchJSON, fetchText },
    } = useFetchContext();
    const [statusMessage, setStatusMessage] = useState<string>("");
    const currentSort = objectDetailsStorage[pid].sortOn ?? "title";
    const childPageSize = 1000;
    const solrSort = "title_sort ASC,id ASC";
    const changeSort = async (sort: string) => {
        if (!confirm("Are you sure you want to change the sort?")) {
            return;
        }
        setStatusMessage("Saving...");
        let offset = 0;
        let response = null;
        do {
            const url = getObjectDirectChildPidsUrl(pid, offset, childPageSize, solrSort);
            response = await fetchJSON(url);
            for (var x in response.docs ?? []) {
                const targetPid = response.docs[x].id;
                if (sort === "custom") {
                    const newPosition = (offset + parseInt(x) + 1)
                    setStatusMessage(`Setting ${targetPid} to position ${newPosition}`);
                    // TODO
                } else {
                    setStatusMessage(`Clearing order for ${pid}`);
                    // TODO
                }
            }
            offset += childPageSize;
        } while (offset < response.numFound ?? 0);
        setStatusMessage("");
    }
    const otherSort = currentSort === "title" ? "custom" : "title";
    return statusMessage.length > 0 ? (
        <div>{statusMessage}</div>
    ) : (
        <div>
            Current sort: {currentSort}
            <button onClick={() => { changeSort(otherSort)}}>Change to {otherSort}</button>
        </div>
    );
};

export default ObjectOrder;