import React, { useState } from "react";
import { useEditorContext } from "../../../context/EditorContext";
import ChildList from "./ChildList";
import AddBox from "@mui/icons-material/AddBox";
import IndeterminateCheckBox from "@mui/icons-material/IndeterminateCheckBox";
import { extractFirstMetadataValue } from "../../../util/metadata";
import ObjectThumbnail from "../ObjectThumbnail";

export interface SelectableChildProps {
    pid: string;
    selectCallback: (pid: string) => void;
    initialTitle: string;
    thumbnail?: boolean;
}

export const SelectableChild = ({
    pid,
    selectCallback,
    initialTitle,
    thumbnail = false,
}: SelectableChildProps): React.ReactElement => {
    const {
        state: { objectDetailsStorage },
    } = useEditorContext();
    const [expanded, setExpanded] = useState<boolean>(false);
    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, pid);
    const details = loaded ? objectDetailsStorage[pid] : {};

    const title = !loaded ? initialTitle : extractFirstMetadataValue(details?.metadata ?? {}, "dc:title", "-");
    const expandControl = (
        <span onClick={() => setExpanded(!expanded)}>
            {expanded ? <IndeterminateCheckBox titleAccess="Collapse Tree" /> : <AddBox titleAccess="Expand Tree" />}
        </span>
    );
    const childList = expanded ? (
        <ChildList pid={pid} selectCallback={selectCallback} pageSize={10} forceThumbs={thumbnail} />
    ) : (
        ""
    );
    return (
        <>
            {expandControl}
            <button
                onClick={() => {
                    selectCallback(pid);
                }}
            >
                {(title.length > 0 ? title : "-") + " [" + pid + "]"}
                {thumbnail ? (
                    <>
                        <br />
                        <ObjectThumbnail pid={pid} />
                    </>
                ) : null}
            </button>
            {childList}
        </>
    );
};

export default SelectableChild;
