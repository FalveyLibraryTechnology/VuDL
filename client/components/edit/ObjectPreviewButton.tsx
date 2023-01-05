import React from "react";
import { useEditorContext } from "../../context/EditorContext";

export interface ObjectPreviewButtonProps {
    pid: string;
}

const ObjectPreviewButton = ({ pid }: ObjectPreviewButtonProps): React.ReactElement => {
    const {
        state: { vufindUrl },
    } = useEditorContext();

    return vufindUrl.length > 0 ? (
        <button
            onClick={() => {
                window.open(vufindUrl + "/Item/" + pid);
            }}
        >
            Preview
        </button>
    ) : <></>;
};

export default ObjectPreviewButton;
