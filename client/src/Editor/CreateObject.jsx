import React, { useEffect, useState } from "react";
import { TreeView, TreeItem } from "@material-ui/lab";

import AjaxHelper from "../AjaxHelper";

const CreateObject = () => {
    const ajax = AjaxHelper.getInstance();
    const [models, setModels] = useState({});
    const [selectedModel, setSelectedModel] = useState("");
    const [results, setResults] = useState("");
    const [title, setTitle] = useState("");
    const [parent, setParent] = useState("");
    const [state, setState] = useState("Inactive");

    const states = ["Active", "Inactive", "Deleted"];

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

    function handleSubmit(event) {
        event.preventDefault();
        const url = ajax.apiUrl + "/edit/object/new";
        const data = {
            title: title,
            parent: parent,
            model: selectedModel,
            state: state,
        };
        console.log(data);
        ajax.ajax({
            method: "post",
            url: url,
            dataType: "json",
            data: data,
            error: function (result, status) {
                setResults("Error! " + result.responseText ?? status);
            },
            success: function (status) {
                console.log(status);
                setResults("Success!");
            },
        });
    }

    function handleParentChange(event) {
        setParent(event.target.value);
    }

    function handleStateChange(event) {
        setState(event.target.value);
    }

    function handleTitleChange(event) {
        setTitle(event.target.value);
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
    let stateControls = [];
    states.forEach((currentState) => {
        stateControls.push(
            <label key={currentState + "-label"}>
                {currentState}
                <input
                    type="radio"
                    name="state"
                    value={currentState}
                    checked={state === currentState}
                    onChange={handleStateChange}
                />
            </label>
        );
    });
    return (
        <form onSubmit={handleSubmit} className="editor__create-object">
            {results.length > 0 ? <div>{"Results: " + results}</div> : ""}
            <label>
                Title
                <input type="text" value={title} name="title" onChange={handleTitleChange} required />
            </label>

            <label>
                Parent ID
                <input type="text" value={parent} name="parent" onChange={handleParentChange} required />
            </label>

            {stateControls}

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
