import React from "react";
import { useEditorContext } from "../../../context/EditorContext";
import DatastreamAgentsContent from "./DatastreamAgentsContent";
import DatastreamLicenseContent from "./DatastreamLicenseContent";
import DatastreamUploadContent from "./DatastreamUploadContent";
import DatastreamDublinCoreContent from "./DatastreamDublinCoreContent";
import DatastreamProcessMetadataContent from "./DatastreamProcessMetadataContent";
import { ProcessMetadataContextProvider } from "../../../context/ProcessMetadataContext";

const uploadModalMapping: Record<string, React.ReactElement> = {
    LICENSE: <DatastreamLicenseContent />,
    AGENTS: <DatastreamAgentsContent />,
    DC: <DatastreamDublinCoreContent />,
    "PROCESS-MD": (
        <ProcessMetadataContextProvider>
            <DatastreamProcessMetadataContent />
        </ProcessMetadataContextProvider>
    ),
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
