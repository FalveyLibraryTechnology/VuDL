import React, { useEffect, forwardRef } from "react";
import PropTypes from "prop-types";
import { usePaginatorContext } from "../../context/PaginatorContext";

const Thumbnail = forwardRef(({ scrollTo, selected, number }, ref) => {
    const {
        state: { order },
        action: { getLabel, getMagicLabel, setPage, getJobImageUrl },
    } = usePaginatorContext();
    useEffect(() => {
        if (selected) {
            scrollTo(number);
        }
    }, [selected]);

    return (
        <div onClick={() => setPage(number)} className={"thumbnail" + (selected ? " selected" : "")} ref={ref}>
            <img alt="" src={getJobImageUrl(order[number], "thumb")} />
            <div className="number">{number + 1}</div>
            <div className={"label" + (getLabel(number) === null ? " magic" : "")}>{getMagicLabel(number)}</div>
        </div>
    );
});
Thumbnail.displayName = "Thumbnail";
Thumbnail.propTypes = {
    scrollTo: PropTypes.func,
    number: PropTypes.number,
    selected: PropTypes.bool,
};

export default Thumbnail;
