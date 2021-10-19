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
            getImageUrl,
            setZoom,
        },
    } = useJobPaginator(initialCategory, initialJob);

    useEffect(() => {
        loadJob();
    }, []);

    const preview =
        order.length > 0 ? (
            <JobPaginatorZoomToggle zoom={zoom} getImageUrl={(size) => getImageUrl(order[currentPage], size)} />
        ) : (
            <div>Preview not available.</div>
        );

    return (
        <div id="paginator">
            <div className="row">
                <div className="six col">{preview}</div>
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
                        getImageUrl={(imageNumber, size) => getImageUrl(order[imageNumber], size)}
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
        getImageUrl: PropTypes.func,
        getJobUrl: PropTypes.func,
        getJSON: PropTypes.func,
    }),
    initialCategory: PropTypes.string,
    initialJob: PropTypes.string,
};

export default JobPaginator;
