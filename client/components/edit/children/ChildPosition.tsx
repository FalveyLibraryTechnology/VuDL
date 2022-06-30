import React from "react";
import { useEditorContext } from "../../../context/EditorContext";

export interface ChildPositionProps {
    pid: string;
    parentPid: string;
}

export const ChildPosition = ({ pid, parentPid }: ChildPositionProps): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
    } = useEditorContext();

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
    return sequence === false ? <></> : <>{sequence}.&nbsp;</>;
};

export default ChildPosition;
