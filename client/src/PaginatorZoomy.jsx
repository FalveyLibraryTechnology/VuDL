import $ from 'jquery';
var React = require('react');

class PaginatorZoomy extends React.Component{
    componentDidMount = () => {
        this.Zoomy.init(document.getElementById('zoomy'));
        this.componentDidUpdate();
    }

    componentDidUpdate = () => {
        this.Zoomy.load(
            this.props.img,
            function() {
                this.Zoomy.resize();
                this.Zoomy.center();
                $(this.refs.status).hide();
            }.bind(this)
        );
    }

    render = () => {
        return (
            <div>
                <div ref="status" id="zoomyStatus">Loading...</div>
                <canvas id="zoomy"></canvas>
            </div>
        );
    }
};

module.exports = PaginatorZoomy;