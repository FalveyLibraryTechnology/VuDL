import React from "react";
import CreateObject from "../../../components/edit/create/CreateObject";

function NewChild(): React.ReactElement {
    return <CreateObject allowNoParentPid={true} allowChangeParentPid={false} />;
}

export default NewChild;
