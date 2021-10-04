import { useState } from "react";
import MagicLabeler from "./MagicLabeler";
import AjaxHelper from "./AjaxHelper";
import {
    countMagicLabels,
    deleteImage,
    deletePageValidation,
    getAddedPages,
    getNonRemovedPages,
    getStatus,
    getJob,
    getLabel,
    putJob,
    validatePublish,
    userMustReviewMoreLabels,
} from "./JobPaginatorState";

const useJobPaginator = (initialCategory, initialJob) => {
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
        const { order } = await getJob(category, job);
        setOrder(order);
        setCurrentPage(0);
        updatePagesByStatus(await getStatus(category, job));
        dispatchEvent(new Event("Prep.loaded"));
    };

    const deletePage = () => {
        if (deletePageValidation(order)) {
            const imageUrl = getImageUrl(order[currentPage], "*");
            const imageFilename = imageUrl.split("/").reverse()[1];
            deleteImage(
                imageUrl,
                () => {
                    const newOrder = getNonRemovedPages(order, [imageFilename]);
                    setOrder(newOrder);
                    if (currentPage >= newOrder.length) {
                        setPage(currentPage - 1);
                    }
                    alert("Page deleted!");
                },
                () => {
                    alert("Unable to delete!");
                }
            );
        }
    };

    const save = async (published) => {
        if (userMustReviewMoreLabels(order)) {
            return;
        }
        saveMagicLabels();

        if (published && !(await validatePublish(category, job))) {
            return;
        }
        putJob(
            { category, job, order, published },
            () => {
                alert("Success!");
                window.location.assign("/paginate"); // TODO: Route better?
                dispatchEvent(new Event("Prep.saved"));
            },
            () => alert("Unable to save!")
        );
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

    const getImageUrl = (orderImage, size) => {
        if (typeof orderImage === "undefined") {
            return false;
        }
        return AjaxHelper.getInstance().getImageUrl(category, job, orderImage.filename, size);
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
            getImageUrl,
            setZoom,
        },
    };
};

export default useJobPaginator;
