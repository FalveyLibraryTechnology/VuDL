import React from "react";
import { useRouter } from "next/router";
import ObjectEditor from "../../../../components/edit/ObjectEditor";

export default function Object() {
    const router = useRouter();
    const { pid } = router.query;
    return <ObjectEditor pid={pid} key={"object-editor-" + pid} />;
}
