import React, { useRef } from "react";
import PropTypes from "prop-types";

import Thumbnail from "./Thumbnail";

const PaginatorList = ({ getLabel, getMagicLabel, setPage, getImageUrl, currentPage, pageCount }) => {
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
                selected={pageIndex === currentPage}
                setPage={setPage}
                getLabel={getLabel}
                getMagicLabel={getMagicLabel}
                getImageUrl={getImageUrl}
                key={pageIndex}
                number={pageIndex}
            />
        );
    }

    return pageCount > 0 ? (
        <div ref={pageList} className="pageList">
            {pages}
        </div>
    ) : (
        // No pages, no visible list element:
        <div></div>
    );
};

PaginatorList.propTypes = {
    currentPage: PropTypes.number,
    pageCount: PropTypes.number,
    getLabel: PropTypes.func,
    getMagicLabel: PropTypes.func,
    setPage: PropTypes.func,
    getImageUrl: PropTypes.func,
};

export default PaginatorList;
