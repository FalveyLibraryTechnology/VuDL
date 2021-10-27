import { useState } from "react";
import MagicLabeler from "./MagicLabeler";
import { useFetchContext } from "./context";
import {
    countMagicLabels,
    deletePageValidation,
    getAddedPages,
    getNonRemovedPages,
    getLabel,
    userMustReviewMoreLabels,
} from "./JobPaginatorState";
import { getImageUrl, getJobUrl } from "./routes";

const useJobPaginator = (initialCategory, initialJob) => {
    const {
        action: { makeRequest, fetchJSON },
    } = useFetchContext();
    const [active] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [zoom, setZoom] = useState(false);
    const [order, setOrder] = useState([]);
    const [magicLabelCache, setMagicLabelCache] = useState([]);
    const [category] = useState(initialCategory);
    const [job] = useState(initialJob);

    const saveMagicLabels = () => {
        order.forEach((o, orderIndex) => {
            if (null === getLabel(order, orderIndex)) {
                setLabel(orderIndex, getMagicLabel(orderIndex));
            }
        });
    };

    const setLabel = (imageNumber, text) => {
        setMagicLabelCache([]); // clear label cache whenever there is a change
        if (typeof order[imageNumber] === "undefined") {
            return;
        }
        order[imageNumber].label = text !== null && text.length === 0 ? null : text;
        setOrder(order);
        dispatchEvent(new Event("Prep.editted"));
    };

    const getMagicLabel = (imageNumber) => {
        const label = getLabel(order, imageNumber);

        if (label) {
            return label;
        }
        if (typeof magicLabelCache[imageNumber] === "undefined") {
            magicLabelCache[imageNumber] = MagicLabeler.getLabel(imageNumber, getMagicLabel);
            setMagicLabelCache(magicLabelCache);
        }
        return magicLabelCache[imageNumber];
    };

    const setPage = (page) => {
        if (page >= 0 && page < order.length) {
            setCurrentPage(page);
        }
    };

    const nextPage = () => {
        setPage(currentPage + 1);
    };

    const prevPage = () => {
        setPage(currentPage - 1);
    };

    const updatePagesByStatus = (status) => {
        const {
            file_problems: { deleted, added },
        } = status;
        const message = [];
        if (deleted.length > 0) {
            message.push(deleted.length + " file(s) have been removed from the job since the last edit.\n");
            setOrder(getNonRemovedPages(order, deleted));
        }

        if (added.length > 0) {
            message.push(added.length + " file(s) have been added to the job since the last edit.\n");
            setOrder(getAddedPages(order, added));
        }

        if (message.length) {
            alert(message.join());
        }
    };

    const loadJob = async () => {
        const { order } = await fetchJSON(getJobUrl(category, job));
        setOrder(order);
        setCurrentPage(0);
        updatePagesByStatus(await fetchJSON(getJobUrl(category, job, "/status")));
        dispatchEvent(new Event("Prep.loaded"));
    };

    const deletePage = async () => {
        if (deletePageValidation(order)) {
            const imageUrl = getJobImageUrl(order[currentPage], "*");
            const imageFilename = imageUrl.split("/").reverse()[1];
            try {
                await makeRequest(imageUrl, { method: "DELETE" });
                const newOrder = getNonRemovedPages(order, [imageFilename]);
                setOrder(newOrder);
                if (currentPage >= newOrder.length) {
                    setPage(currentPage - 1);
                }
                alert("Page deleted!");
            } catch (error) {
                console.error(error);
                alert("Unable to delete!");
            }
        }
    };
    const publishValid = async (published) => {
        if (published) {
            const {
                derivatives: { expected, processed },
            } = await fetchJSON(getJobUrl(category, job, "/status"));
            if (expected > processed) {
                alert(
                    `Derivative images have not been generated yet. Please` +
                        ` go back to the main menu and hit the "build" button` +
                        ` for this job before publishing it.`
                );
                return false;
            }
            return window.confirm(
                "Are you sure you wish to publish this job? You will not be able to make any further edits."
            );
        }
        return true;
    };

    const save = async (published) => {
        if (userMustReviewMoreLabels(order)) {
            return;
        }
        saveMagicLabels();
        if (await publishValid(published)) {
            try {
                await makeRequest(
                    getJobUrl(category, job),
                    {
                        method: "PUT",
                        body: JSON.stringify({ order, published }),
                    },
                    {
                        "Content-Type": "application/json",
                    }
                );
                alert("Success!");
                window.location.assign("/paginate"); // TODO: Route better?
                dispatchEvent(new Event("Prep.saved"));
            } catch (error) {
                alert("Unable to save!");
            }
        }
    };

    const autonumberFollowingPages = () => {
        const affected = order.length - (currentPage + 1) - countMagicLabels(order, currentPage + 1);
        if (affected > 0 && !window.confirm("You will be clearing " + affected + " label(s). Are you sure?")) {
            return;
        }

        for (let i = currentPage + 1; i < order.length; i++) {
            setLabel(i, null);
        }
    };

    const getJobImageUrl = (orderImage, size) => {
        if (typeof orderImage === "undefined") {
            return false;
        }
        return getImageUrl(category, job, orderImage.filename, size);
    };

    return {
        state: {
            active,
            currentPage,
            zoom,
            order,
            magicLabelCache,
            category,
            job,
        },
        action: {
            getLabel: (imageNumber) => {
                return getLabel(order, imageNumber);
            },
            setLabel,
            getMagicLabel,
            setPage,
            nextPage,
            prevPage,
            deletePage,
            loadJob,
            setOrder,
            save,
            autonumberFollowingPages,
            getJobImageUrl,
            setZoom,
        },
    };
};

export default useJobPaginator;
