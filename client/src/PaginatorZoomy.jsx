import React from "react";
import PropTypes from "prop-types";

import Zoomy from "./Zoomy";

class PaginatorZoomy extends React.Component {
    constructor(props) {
        super(props);
        this.status = React.createRef();
    }

    componentDidMount() {
        Zoomy.init(document.getElementById("zoomy"));
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        Zoomy.load(
            this.props.img,
            function () {
                Zoomy.resize();
                Zoomy.center();
                this.status.current.className = "hidden";
            }.bind(this)
        );
    }

    render() {
        return (
            <div>
                <div ref={this.status} id="zoomyStatus">
                    Loading...
                </div>
                <canvas id="zoomy"></canvas>
            </div>
        );
    }
}

PaginatorZoomy.propTypes = {
    img: PropTypes.string,
};

export default PaginatorZoomy;
