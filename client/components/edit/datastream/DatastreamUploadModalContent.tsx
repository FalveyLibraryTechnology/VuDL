import React from "react";
import { useEditorContext } from "../../../context/EditorContext";
import DatastreamLicenseContent from "./DatastreamLicenseContent";
import DatastreamUploadContent from "./DatastreamUploadContent";

const uploadModalMapping = {
    LICENSE: <DatastreamLicenseContent />,
};

const DatastreamUploadModalContent = (): React.ReactElement => {
    const {
        state: { activeDatastream },
    } = useEditorContext();

    if (Object.keys(uploadModalMapping).includes(activeDatastream)) {
        return uploadModalMapping[activeDatastream];
    }
    return <DatastreamUploadContent />;
};

export default DatastreamUploadModalContent;
