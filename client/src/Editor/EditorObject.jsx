import React from "react";
import PropTypes from "prop-types";

import AjaxHelper from "../AjaxHelper";
import ChildList from "./ChildList";

import "../css/editor.css";

class EditorObject extends React.Component {
    static propTypes = {
        pid: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.ajax = AjaxHelper.getInstance();
        // TODO: Get details
    }

    render() {
        return (
            <div>
                <h1>{this.props.pid}</h1>
                <ChildList parentID={this.props.pid} />
            </div>
        );
    }
}

export default EditorObject;
