import React, { useEffect, forwardRef } from "react";
import PropTypes from "prop-types";

const Thumbnail = forwardRef(({ scrollTo, getLabel, getMagicLabel, setPage, getImageUrl, selected, number }, ref) => {
    useEffect(() => {
        if (selected) {
            scrollTo(number);
        }
    }, [selected]);

    return (
        <div onClick={() => setPage(number)} className={"thumbnail" + (selected ? " selected" : "")} ref={ref}>
            <img alt="" src={getImageUrl(number, "thumb")} />
            <div className="number">{number + 1}</div>
            <div className={"label" + (getLabel(number) === null ? " magic" : "")}>{getMagicLabel(number)}</div>
        </div>
    );
});
Thumbnail.displayName = "Thumbnail";
Thumbnail.propTypes = {
    // JobList
    scrollTo: PropTypes.func,
    number: PropTypes.number,
    // JobPaginator
    getImageUrl: PropTypes.func,
    getLabel: PropTypes.func,
    getMagicLabel: PropTypes.func,
    setPage: PropTypes.func,
    selected: PropTypes.bool,
};

export default Thumbnail;
