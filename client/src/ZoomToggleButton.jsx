import React from "react";
import PropTypes from "prop-types";

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
    // JobPaginator
    paginator: PropTypes.shape({
        toggleZoom: PropTypes.func,
        state: PropTypes.shape({
            zoom: PropTypes.bool,
        }),
    }),
};

export default ZoomToggleButton;
