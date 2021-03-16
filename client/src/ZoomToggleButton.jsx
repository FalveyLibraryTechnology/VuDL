var React = require('react');

class ZoomToggleButton extends React.Component{
    render = () => {
        return (
            <button onClick={this.props.paginator.toggleZoom}>{this.props.paginator.state.zoom ? 'Turn Zoom Off' : 'Turn Zoom On'}</button>
        );
    }
};

module.exports = ZoomToggleButton;