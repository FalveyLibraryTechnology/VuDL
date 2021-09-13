import React, { useEffect, forwardRef } from "react";
import PropTypes from "prop-types";

const Thumbnail = forwardRef(({ scrollTo, paginator, selected, number }, ref) => {
    const label = paginator.getLabel(number);
    const selectPage = () => {
        paginator.setPage(number);
    };
    useEffect(() => {
        if (selected) {
            scrollTo(number);
        }
    }, [selected]);

    return (
        <div onClick={selectPage} className={"thumbnail" + (selected ? " selected" : "")} ref={ref}>
            <img alt="" src={paginator.getImageUrl(number, "thumb")} />
            <div className="number">{number + 1}</div>
            <div className={"label" + (null === paginator.getLabel(number, false) ? " magic" : "")}>{label}</div>
        </div>
    );
});
Thumbnail.displayName = "Thumbnail";
Thumbnail.propTypes = {
    // JobList
    scrollTo: PropTypes.func,
    number: PropTypes.number,
    // JobPaginator
    paginator: PropTypes.shape({
        getLabel: PropTypes.func,
        getImageUrl: PropTypes.func,
        setPage: PropTypes.func,
    }),
    selected: PropTypes.bool,
};

export default Thumbnail;
