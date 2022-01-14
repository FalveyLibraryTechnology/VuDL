import React, { useEffect } from "react";
import PropTypes from "prop-types";
import JobPaginatorZoomToggle from "./JobPaginatorZoomToggle";
import PaginatorControls from "./PaginatorControls";
import PaginatorList from "./PaginatorList";
import { usePaginatorContext } from "../../context/PaginatorContext";

const JobPaginator = ({ initialCategory, initialJob }) => {
    const {
        state: { category, job },
        action: { loadJob },
    } = usePaginatorContext();

    useEffect(() => {
        loadJob(initialCategory, initialJob);
    }, []);

    return (
        <div id="paginator">
            <div className="row">
                <div className="six col">
                    <JobPaginatorZoomToggle />
                </div>
                <div className="six col">
                    <p>
                        {category} &gt; {job}
                    </p>
                    <PaginatorControls />
                    <PaginatorList />
                </div>
            </div>
        </div>
    );
};

JobPaginator.propTypes = {
    initialCategory: PropTypes.string,
    initialJob: PropTypes.string,
};

export default JobPaginator;
