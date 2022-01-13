import React from "react";
import { useSessionStorage } from "../../util/sessionStorage";
import PropTypes from "prop-types";
import JobList from "./JobList";

const Category = ({ data }) => {
    const { jobs, category } = data;
    const [open, setOpen] = useSessionStorage("open-" + category, false);
    const toggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!open);
    };
    return (
        <div className="jobCategory">
            {jobs.length ? (
                <h2>
                    <button className="btn-link" onClick={toggle}>
                        {open ? "[–]" : "[+]"}
                    </button>{" "}
                    {category}
                </h2>
            ) : (
                <h2>{category + " [no jobs]"}</h2>
            )}
            {open && <JobList category={category} data={jobs} />}
        </div>
    );
};

Category.propTypes = {
    data: PropTypes.exact({
        category: PropTypes.string,
        jobs: PropTypes.arrayOf(PropTypes.string),
    }),
};

export default Category;
