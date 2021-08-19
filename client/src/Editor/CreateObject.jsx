import React from "react";
import { TreeView, TreeItem } from "@material-ui/lab";

import AjaxHelper from "../AjaxHelper";

export default class CreateObject extends React.Component {
    constructor(props) {
        super(props);
        this.ajax = AjaxHelper.getInstance();
        this.state = { models: {}, selectedModel: null };
        // BIND
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount() {
        this.ajax.getJSONPromise(this.ajax.apiUrl + "/edit/models").then((json) => {
            this.setState({ models: json });
        });
    }

    renderTree(nodes) {
        return (
            <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
                {Array.isArray(nodes.children) ? nodes.children.map((node) => this.renderTree(node)) : null}
            </TreeItem>
        );
    }

    handleSelect(event, model) {
        event.preventDefault();
        // Ignore categories
        if (model.slice(0, 2) == "__") {
            return;
        }
        this.setState({ selectedModel: model });
        return false;
    }

    render() {
        let categories = [];
        for (let category in this.state.models) {
            let children = [];
            for (let model in this.state.models[category]) {
                let value = this.state.models[category][model];
                children.push(<TreeItem key={model} nodeId={value} label={model} />);
            }
            categories.push(
                <TreeItem key={category} nodeId={`__${category}`} label={category}>
                    {children}
                </TreeItem>
            );
        }
        return (
            <form className="editor__create-object" action={this.ajax.apiUrl + "/object/new"}>
                <label>
                    Title
                    <input type="text" name="title" required />
                </label>

                <label>
                    Parent ID
                    <input type="text" name="parent" required />
                </label>

                <label>
                    <input type="radio" name="active" value="1" />
                    Active
                </label>

                <label>
                    <input type="radio" name="active" value="0" checked />
                    Inactive
                </label>

                <label>
                    Select Model Type:
                    <b>{this.state.selectedModel}</b>
                </label>
                <TreeView defaultCollapseIcon={"➖"} defaultExpandIcon={"➕"} onNodeSelect={this.handleSelect}>
                    {categories}
                </TreeView>

                {this.state.selectedModel && <button>Create Object</button>}
            </form>
        );
    }
}
