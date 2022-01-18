import React from "react";
import { useRouter } from "next/router";
import CreateObject from "../../../../components/edit/CreateObject";

export default function CreateObjectChild() {
    const router = useRouter();
    const { pid } = router.query;
    return <CreateObject parentPid={pid} allowNoParentPid={false} allowChangeParentPid={false} />;
}
