import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { TreeView, TreeItem } from "@material-ui/lab";

import AjaxHelper from "../AjaxHelper";

const CreateObject = ({ parentPid = "", allowNoParentPid = false, allowChangeParentPid = true }) => {
    // Validate properties
    if (!allowChangeParentPid && !allowNoParentPid && parentPid === "") {
        throw new Error("allowChangeParentPid and allowNoParentPid cannot both be false when parentPid is empty.");
    }
    if (allowNoParentPid && !allowChangeParentPid) {
        throw new Error("allowNoParentPid=true requires allowChangeParentPid to be true");
    }
    const ajax = AjaxHelper.getInstance();
    const [models, setModels] = useState({});
    const [selectedModel, setSelectedModel] = useState("");
    const [results, setResults] = useState("");
    const [title, setTitle] = useState("");
    const [parent, setParent] = useState(parentPid);
    const [noParent, setNoParent] = useState(allowNoParentPid && parentPid === "");
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
            title,
            parent,
            model: selectedModel,
            state,
        };
        ajax.ajax({
            method: "post",
            url,
            dataType: "json",
            data,
            error: function (result, status) {
                setResults("Error! " + result.responseText ?? status);
            },
            success: function () {
                setResults("Success!");
            },
        });
    }

    function handleNoParentChange(event) {
        setNoParent(event.target.checked);
        if (allowChangeParentPid && event.target.checked) {
            setParent("");
        }
    }

    function handleParentChange(event) {
        setParent(event.target.value);
        if (allowNoParentPid) {
            setNoParent(event.target.value.length === 0);
        }
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
    const stateControls = states.map((currentState) => (
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
    ));
    let noParentControl = "";
    if (allowNoParentPid) {
        noParentControl = allowChangeParentPid ? (
            <label>
                <input type="checkbox" name="noParent" value="1" onChange={handleNoParentChange} checked={noParent} />
                No parent PID
            </label>
        ) : (
            <input type="hidden" name="noParent" value="1" />
        );
    }
    let parentControl = "";
    if (allowChangeParentPid || parent.length > 0) {
        parentControl = allowChangeParentPid ? (
            <label>
                Parent ID
                <input type="text" value={parent} name="parent" onChange={handleParentChange} required={!noParent} />
            </label>
        ) : (
            <input type="hidden" value={parent} name="parent" />
        );
    }

    return (
        <form onSubmit={handleSubmit} className="editor__create-object">
            {results.length > 0 ? <div>{"Results: " + results}</div> : ""}
            <label>
                Title
                <input type="text" value={title} name="title" onChange={handleTitleChange} required />
            </label>

            {noParentControl}
            {parentControl}
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

CreateObject.propTypes = {
    parentPid: PropTypes.string,
    allowChangeParentPid: PropTypes.bool,
    allowNoParentPid: PropTypes.bool,
};

export default CreateObject;
