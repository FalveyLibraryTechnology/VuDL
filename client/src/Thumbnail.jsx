import React from "react";
import PropTypes from "prop-types";

import { paginatorStore, getImageUrl, getLabel, setPage } from "./paginator-store";

class Thumbnail extends React.Component {
    constructor(props) {
        super(props);
        this.wrapper = React.createRef();
    }

    componentDidUpdate() {
        if (this.props.selected) {
            this.props.list.scrollTo(this.wrapper);
        }

        paginatorStore.subscribe(({ currentPage }) => {
            this.selected = currentPage === this.props.number;
        });
    }

    render() {
        var label = getLabel(this.props.number);
        // check for magic labels:
        var labelClass = "label" + (null === getLabel(this.props.number, false) ? " magic" : "");
        var myClass = "thumbnail" + (this.selected ? " selected" : "");
        return (
            <div onClick={() => setPage(this.props.number)} className={myClass} ref={this.wrapper}>
                <img alt="" src={getImageUrl(this.props.number, "thumb")} />
                <div className="number">{this.props.number + 1}</div>
                <div className={labelClass}>{label}</div>
            </div>
        );
    }
}

Thumbnail.propTypes = {
    // JobList
    list: PropTypes.shape({ scrollTo: PropTypes.func }),
    number: PropTypes.number,
    selected: PropTypes.bool,
};

export default Thumbnail;
