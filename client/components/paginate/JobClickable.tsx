import React from "react";
import PropTypes from "prop-types";

import Link from "next/link";

const JobClickable = ({ category, children, clickable, clickWarning }) => {
    const handleClick = (e) => {
        if (clickWarning && !window.confirm(clickWarning)) {
            e.preventDefault();
            return false;
        }
    };
    return clickable ? (
        <Link href={`/paginate/${category}/${children}`} onClick={handleClick}>
            {children}
        </Link>
    ) : (
        <span>{children}</span>
    );
};

JobClickable.propTypes = {
    category: PropTypes.string,
    children: PropTypes.string,
    clickable: PropTypes.bool,
    clickWarning: PropTypes.string,
};
export default JobClickable;
