import React from "react";
import { useEditorContext } from "../../context/EditorContext";
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

    const currentSort = objectDetailsStorage[pid].sortOn ?? "title";
    const changeSort = (sort: string) => {
        if (confirm("Are you sure you want to change the sort?")) {
            alert(sort);
        }
    }
    const otherSort = currentSort === "title" ? "custom" : "title";
    return (
        <div>
            Current sort: {currentSort}
            <button onClick={() => { changeSort(otherSort)}}>Change to {otherSort}</button>
        </div>
    );
};

export default ObjectOrder;