import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

import Zoomy from "../../util/Zoomy";

const PaginatorZoomy = ({ img }) => {
    const status = useRef();
    const initializeZoomy = () => {
        Zoomy.init(document.getElementById("zoomy"));
    };
    const loadZoomy = () => {
        Zoomy.load(
            img,
            function () {
                Zoomy.resize();
                Zoomy.center();
                status.current.className = "hidden";
            }.bind(this)
        );
    };

    useEffect(() => {
        initializeZoomy();
        loadZoomy();
    }, []);

    return (
        <div>
            <div ref={status} id="zoomyStatus">
                Loading...
            </div>
            <canvas id="zoomy"></canvas>
        </div>
    );
};

PaginatorZoomy.propTypes = {
    img: PropTypes.string,
};

export default PaginatorZoomy;
