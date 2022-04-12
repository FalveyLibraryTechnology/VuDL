import React from "react";
import { useRouter } from "next/router";
import ObjectEditor from "../../../../components/edit/ObjectEditor";
import { EditorContextProvider } from "../../../../context/EditorContext";

export default function Object(): React.ReactElement {
    const router = useRouter();
    const { pid } = router.query;
    if (router.isReady) {
        return (
            <EditorContextProvider>
                <ObjectEditor pid={pid} key={"object-editor-" + pid} />
            </EditorContextProvider>
        );
    }
    return <React.Fragment />;
}
