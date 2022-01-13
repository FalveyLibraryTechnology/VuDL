import React from "react";
import PropTypes from "prop-types";

import Job from "./Job";

const JobList = ({ category, data }) => {
    return (
        <ul>
            {data.map((job) => (
                <Job category={category} key={category + "|" + job}>
                    {job}
                </Job>
            ))}
        </ul>
    );
};

JobList.propTypes = {
    category: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.string),
};

export default JobList;
