import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { useEditorContext } from "../../../context/EditorContext";
import { useFetchContext } from "../../../context/FetchContext";
import { getPositionInParentUrl } from "../../../util/routes";

export interface ChildPositionProps {
    pid: string;
    parentPid: string;
}

export const ChildPosition = ({ pid, parentPid }: ChildPositionProps): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
        action: { clearPidFromChildListStorage, removeFromObjectDetailsStorage },
    } = useEditorContext();
    const {
        action: { fetchText },
    } = useFetchContext();
    const [statusMessage, setStatusMessage] = useState<string>("");

    // Important: this component assumes it will be called in a context where pid and parent pid
    // details are already loaded into the context; it will not cause a load to occur by itself.
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, pid);
    const parentLoaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, parentPid);
    const details = loaded ? objectDetailsStorage[pid] : {};
    const parentDetails = parentLoaded ? objectDetailsStorage[parentPid] : {};
    const parentSort = parentDetails.sortOn ?? "title";

    function findSequence(sequences: Array<string>): number | boolean {
        // We only need a sequence number if we're inside a sorted parent...
        if (parentSort === "custom") {
            for (let x = 0; x < sequences.length; x++) {
                const parts = sequences[x].split("#");
                if (parts[0] === parentPid) {
                    return parseInt(parts[1]);
                }
            }
        }
        return false;
    }

    const sequence = findSequence(details.sequences ?? []);
    async function saveChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newValue = parseInt(event.target.value);
        if (newValue === sequence) {
            // Don't save if nothing has changed:
            return;
        }
        setStatusMessage("Saving...");
        const target = getPositionInParentUrl(pid, parentPid);
        const result = await fetchText(target, { method: "PUT", body: newValue });
        if (result === "ok") {
            // Clear and reload the cached object, since it has now changed!
            removeFromObjectDetailsStorage(pid);
            // Clear any cached lists belonging to the parent PID, because the
            // order has potentially changed!
            clearPidFromChildListStorage(parentPid);
        }
        setStatusMessage("");
    }
    if (statusMessage.length > 0) {
        return <>{statusMessage}</>;
    }
    return sequence === false ? (
        <></>
    ) : (
        <TextField
            sx={{ width: "5em", marginRight: 1 }}
            size="small"
            aria-label={`Position in ${parentPid}`}
            defaultValue={sequence}
            onBlur={saveChange}
        />
    );
};

export default ChildPosition;
