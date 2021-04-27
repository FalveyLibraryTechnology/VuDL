import React from "react";
import PropTypes from "prop-types";

const PaginatorControls = require("./JobPaginator");

class ZoomToggleButton extends React.Component {
    render() {
        return (
            <button onClick={this.props.paginator.toggleZoom}>
                {this.props.paginator.state.zoom ? "Turn Zoom Off" : "Turn Zoom On"}
            </button>
        );
    }
}

ZoomToggleButton.propTypes = {
    paginator: PropTypes.instanceOf(PaginatorControls),
};

module.exports = ZoomToggleButton;
