import React from "react";
import { useRouter } from "next/router";
import CreateObject from "../../../../components/edit/create/CreateObject";

export default function CreateObjectChild(): React.ReactElement {
    const router = useRouter();
    const { pid } = router.query;
    if (router.isReady) {
        return <CreateObject parentPid={pid} allowNoParentPid={false} allowChangeParentPid={false} />;
    }
    return <React.Fragment />;
}
