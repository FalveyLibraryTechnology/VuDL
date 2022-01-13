import React, { useRef } from "react";

import { usePaginatorContext } from "../../context/PaginatorContext";
import Thumbnail from "./Thumbnail";
const PaginatorList = () => {
    const {
        state: { order, currentPage },
    } = usePaginatorContext();
    const pageCount = order.length;
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
                key={pageIndex}
                number={pageIndex}
            />
        );
    }

    return pageCount > 0 ? (
        <div ref={pageList} className="pageList">
            {pages}
        </div>
    ) : null;
};

export default PaginatorList;
