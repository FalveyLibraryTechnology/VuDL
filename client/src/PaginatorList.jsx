import React, { useRef } from "react";
import PropTypes from "prop-types";

import Thumbnail from "./Thumbnail";

const PaginatorList = ({ pageCount, paginator }) => {
    const pageList = useRef();
    const thumbRefs = useRef([]);
    const scrollTo = (number) => {
        const pageListOffset = pageList.current.offsetTop;
        var listOffset = pageListOffset + (thumbRefs.current[0].offsetTop - pageListOffset);
        pageList.current.scrollTop = thumbRefs.current[number].offsetTop - listOffset;
    };
    const pages = [];
    let pageIndex;
    for (pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        pages[pageIndex] = (
            <Thumbnail
                ref={(thumbRef) => {
                    thumbRefs.current.push(thumbRef);
                }}
                scrollTo={scrollTo}
                selected={pageIndex === paginator.state.currentPage}
                paginator={paginator}
                key={pageIndex}
                number={pageIndex}
            />
        );
    }

    return (
        <div ref={pageList} className="pageList">
            {pages}
        </div>
    );
};

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
