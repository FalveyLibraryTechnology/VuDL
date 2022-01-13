import React from "react";
import CreateObject from "../../../components/edit/CreateObject";

function NewChild() {
    return <CreateObject allowNoParentPid={true} allowChangeParentPid={false} />;
}

export default NewChild;
