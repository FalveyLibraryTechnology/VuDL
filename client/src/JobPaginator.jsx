import React, { useEffect } from "react";
import PropTypes from "prop-types";

import JobPaginatorZoomToggle from "./JobPaginatorZoomToggle";
import PaginatorControls from "./PaginatorControls";
import PaginatorList from "./PaginatorList";
import useJobPaginator from "./useJobPaginator";

const JobPaginator = ({ initialCategory, initialJob }) => {
    const {
        state: { currentPage, zoom, order, category, job },
        action: {
            setLabel,
            getLabel,
            getMagicLabel,
            setPage,
            nextPage,
            prevPage,
            deletePage,
            save,
            loadJob,
            autonumberFollowingPages,
            getJobImageUrl,
            setZoom,
        },
    } = useJobPaginator(initialCategory, initialJob);

    useEffect(() => {
        loadJob();
    }, []);

    return (
        <div id="paginator">
            <div className="row">
                <div className="six col">
                    <JobPaginatorZoomToggle
                        enabled={order.length > 0}
                        zoom={zoom}
                        getJobImageUrl={(size) => getJobImageUrl(order[currentPage], size)}
                    />
                </div>
                <div className="six col">
                    <p>
                        {category} &gt; {job}
                    </p>
                    <PaginatorControls
                        autonumberFollowingPages={autonumberFollowingPages}
                        currentPage={currentPage}
                        getLabel={getLabel}
                        getMagicLabel={getMagicLabel}
                        setLabel={setLabel}
                        prevPage={prevPage}
                        nextPage={nextPage}
                        deletePage={deletePage}
                        save={save}
                        toggleZoom={() => {
                            setZoom(!zoom);
                        }}
                        zoom={zoom}
                        pageCount={order.length}
                    />
                    <PaginatorList
                        setPage={setPage}
                        getLabel={getLabel}
                        getMagicLabel={getMagicLabel}
                        setLabel={setLabel}
                        getJobImageUrl={(imageNumber, size) => getJobImageUrl(order[imageNumber], size)}
                        currentPage={currentPage}
                        pageCount={order.length}
                    />
                </div>
            </div>
        </div>
    );
};

JobPaginator.propTypes = {
    // VuDLPrep
    app: PropTypes.shape({
        activateJobSelector: PropTypes.func,
        ajax: PropTypes.func,
        getJobImageUrl: PropTypes.func,
        getJobUrl: PropTypes.func,
        fetchJSON: PropTypes.func,
    }),
    initialCategory: PropTypes.string,
    initialJob: PropTypes.string,
};

export default JobPaginator;
