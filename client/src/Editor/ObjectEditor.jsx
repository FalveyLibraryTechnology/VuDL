import React from "react";
import PropTypes from "prop-types";

import AjaxHelper from "../AjaxHelper";
import ChildList from "./ChildList";
import Modal from "./Modal";

import "../css/editor.css";

class ObjectEditor extends React.Component {
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

                <Modal />
            </div>
        );
    }
}

ObjectEditor.propTypes = {
    pid: PropTypes.string,
};

export default ObjectEditor;
