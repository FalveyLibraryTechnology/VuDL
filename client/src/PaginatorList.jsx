import React from "react";
import PropTypes from "prop-types";

import Thumbnail from "./Thumbnail";

class PaginatorList extends React.Component {
    constructor(props) {
        super(props);
        this.pageList = React.createRef();
    }

    scrollTo(thumb) {
        const pageListOffset = this.pageList.current.offsetTop;
        var listOffset = pageListOffset + (this.firstThumb.wrapper.current.offsetTop - pageListOffset);
        this.pageList.current.scrollTop = thumb.current.offsetTop - listOffset;
    }

    render() {
        var pages = [];
        for (let i = 0; i < this.props.pageCount; i++) {
            pages[i] = (
                <Thumbnail
                    ref={(t) => {
                        if (i === 0 && t !== null) {
                            this.firstThumb = t;
                        }
                    }}
                    list={this}
                    selected={i === this.props.paginator.state.currentPage}
                    paginator={this.props.paginator}
                    key={i}
                    number={i}
                />
            );
        }
        return (
            <div ref={this.pageList} className="pageList">
                {pages}
            </div>
        );
    }
}

PaginatorList.propTypes = {
    // JobPaginator
    paginator: PropTypes.shape({
        state: PropTypes.shape({
            currentPage: PropTypes.number,
        }),
    }),
    pageCount: PropTypes.number,
};

export default PaginatorList;
