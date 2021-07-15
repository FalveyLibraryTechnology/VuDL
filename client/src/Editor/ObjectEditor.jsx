import React from "react";
import PropTypes from "prop-types";

import AjaxHelper from "../AjaxHelper";
import ChildList from "./ChildList";
import MetadataEditor from "./MetadataEditor";
import Modal from "./Modal";

import "../css/editor.css";

class ObjectEditor extends React.Component {
    static propTypes = {
        pid: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.ajax = AjaxHelper.getInstance();
        this.state = { modal: null };
        // TODO: Get details
        this.openMetadataEditor = this.openMetadataEditor.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openMetadataEditor(pid) {
        console.log("AAAAA " + pid);
        this.setState({ modal: <MetadataEditor pid={pid} /> });
        console.log(this.state.modal);
        this.render();
    }

    closeModal() {
        this.setState({ modal: null });
    }

    render() {
        return (
            <div>
                <h1>{this.props.pid}</h1>
                <ChildList parentID={this.props.pid} openMetadataEditor={this.openMetadataEditor} />

                <p>Is modal open? {this.state.modal == null ? "no" : "yes"}</p>

                <Modal title="test" open={this.state.modal != null} closeModal={this.closeModal}>
                    {this.state.modal ?? ""}
                </Modal>
            </div>
        );
    }
}

export default ObjectEditor;
