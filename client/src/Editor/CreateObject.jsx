import React, { useEffect, useState } from "react";
import { TreeView, TreeItem } from "@material-ui/lab";

import AjaxHelper from "../AjaxHelper";

const CreateObject = () => {
    const ajax = AjaxHelper.getInstance();
    const [models, setModels] = useState({});
    const [selectedModel, setSelectedModel] = useState("");

    useEffect(() => {
        ajax.getJSONPromise(ajax.apiUrl + "/edit/models").then((json) => {
            setModels(json);
        });
    }, []);

    function handleSelect(event, model) {
        event.preventDefault();
        // Ignore categories
        if (model.slice(0, 2) == "__") {
            return;
        }
        setSelectedModel(model);
        return false;
    }

    let categories = [];
    for (let category in models) {
        let children = [];
        for (let model in models[category]) {
            let value = models[category][model];
            children.push(<TreeItem key={model} nodeId={value} label={model} />);
        }
        categories.push(
            <TreeItem key={category} nodeId={`__${category}`} label={category}>
                {children}
            </TreeItem>
        );
    }
    return (
        <form className="editor__create-object" method="post" action={ajax.apiUrl + "/edit/object/new"}>
            <label>
                Title
                <input type="text" name="title" required />
            </label>

            <label>
                Parent ID
                <input type="text" name="parent" required />
            </label>

            <label>
                <input type="radio" name="state" value="Active" />
                Active
            </label>

            <label>
                <input type="radio" name="state" value="Inactive" defaultChecked />
                Inactive
            </label>

            <label>
                <input type="radio" name="state" value="Deleted" />
                Deleted
            </label>

            <label>
                Select Model Type:
                <b>{selectedModel}</b>
            </label>
            <TreeView defaultCollapseIcon={"➖"} defaultExpandIcon={"➕"} onNodeSelect={handleSelect}>
                {categories}
            </TreeView>

            {selectedModel && <button>Create Object</button>}
        </form>
    );
};

export default CreateObject;
