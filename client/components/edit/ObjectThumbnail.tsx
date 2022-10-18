import React from "react";
import { useEditorContext } from "../../context/EditorContext";

export interface ObjectThumbnailProps {
    pid: string;
}

const ObjectThumbnail = ({ pid }: ObjectThumbnailProps): React.ReactElement => {
    const {
        state: { vufindUrl, objectDetailsStorage },
    } = useEditorContext();

    const loaded = Object.prototype.hasOwnProperty.call(objectDetailsStorage, pid);
    const datastreams = loaded ? objectDetailsStorage[pid].datastreams : [];
    const thumbnailAvailable = vufindUrl.length > 0 && datastreams.includes("THUMBNAIL");

    return thumbnailAvailable ? (
        <img alt="" style={{ float: "right", border: "1px solid black" }} src={`${vufindUrl}/files/${pid}/THUMBNAIL`} />
    ) : (
        <span style={{ float: "right" }}>No Thumbnail</span>
    );
};

export default ObjectThumbnail;
