const React = require("react");
const PropTypes = require("prop-types");

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
    paginator: PropTypes.shape({ type: PropTypes.oneOf([PaginatorControls]) }),
};

module.exports = ZoomToggleButton;
