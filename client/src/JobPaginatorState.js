import AjaxHelper from "./AjaxHelper";

const confirmSavedMagicLabels = (count) => {
    return window.confirm("You will be saving " + count + " unreviewed, auto-generated label(s). Are you sure?");
};

const findNewPagePosition = (page, list) => {
    const foundIndex = list.findIndex((listItem) => {
        return listItem.filename >= page;
    });
    return foundIndex === -1 ? list.length : foundIndex;
};

const getJob = (category, job) => {
    const ajax = AjaxHelper.getInstance();
    return new Promise((resolve /*, reject*/) =>
        ajax.getJSON(ajax.getJobUrl(category, job), null, (data) => {
            resolve(data);
        })
    );
};

const getStatus = (category, job) => {
    const ajax = AjaxHelper.getInstance();
    return new Promise((resolve) =>
        ajax.getJSON(ajax.getJobUrl(category, job, "/status"), null, (data) => {
            resolve(data);
        })
    );
};

const deleteImage = (imageUrl, success, error) => {
    AjaxHelper.getInstance().ajax({
        type: "DELETE",
        url: imageUrl,
        success,
        error,
    });
};

const putJob = ({ category, job, order, published }, success, error) => {
    const ajax = AjaxHelper.getInstance();
    ajax.ajax({
        type: "PUT",
        url: ajax.getJobUrl(category, job),
        contentType: "application/json",
        data: JSON.stringify({ order, published }),
        success,
        error,
    });
};

const deletePageValidation = (order) => {
    if (order.length < 2) {
        alert("You cannot delete the last page in a job.");
        return false;
    }
    return window.confirm("Are you sure you wish to delete the current page?");
};

const getAddedPages = (order, pages) => {
    return pages.reduce((order, page) => {
        order.splice(findNewPagePosition(page, order), 0, {
            filename: page,
            label: null,
        });
        return order;
    }, order);
};

const getNonRemovedPages = (order, deletedPages) =>
    order.filter((o) =>
        deletedPages.every((page) => {
            return o.filename !== page;
        })
    );

const validatePublish = async (category, job) => {
    const response = await getStatus(category, job);
    const {
        derivatives: { expected, processed },
    } = response;
    if (expected > processed) {
        alert(
            `Derivative images have not been generated yet. Please` +
                ` go back to the main menu and hit the "build" button` +
                ` for this job before publishing it.`
        );
        return false;
    }
    return window.confirm("Are you sure you wish to publish this job? You will not be able to make any further edits.");
};

const getLabel = (order, imageNumber) => {
    return typeof order[imageNumber] === "undefined" ? null : order[imageNumber].label;
};

const countMagicLabels = (order, startAt) => {
    let count = 0;
    for (let startIndex = startAt; startIndex < order.length; startIndex++) {
        if (null === getLabel(order, startIndex)) {
            count++;
        }
    }
    return count;
};

const userMustReviewMoreLabels = (order) => {
    const count = countMagicLabels(order, 0);
    return count > 0 && !confirmSavedMagicLabels(count);
};

export {
    countMagicLabels,
    deleteImage,
    deletePageValidation,
    getAddedPages,
    getNonRemovedPages,
    getStatus,
    getJob,
    getLabel,
    putJob,
    confirmSavedMagicLabels,
    validatePublish,
    userMustReviewMoreLabels,
};
