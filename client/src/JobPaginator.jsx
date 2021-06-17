import React from "react";
import PropTypes from "prop-types";

import AjaxHelper from "./AjaxHelper";
import MagicLabeler from "./MagicLabeler";
import PaginatorControls from "./PaginatorControls";
import PaginatorList from "./PaginatorList";
import PaginatorPreview from "./PaginatorPreview";
import PaginatorZoomy from "./PaginatorZoomy";

class JobPaginator extends React.Component {
    constructor(props) {
        super(props);
        this.magicLabelCache = [];
        this.state = { active: false, currentPage: 0, zoom: false, order: [] };
        this.ajax = AjaxHelper.getInstance();
        // BIND
        this.autonumberFollowingPages = this.autonumberFollowingPages.bind(this);
        this.getLabel = this.getLabel.bind(this);
        this.toggleZoom = this.toggleZoom.bind(this);
    }

    getImageUrl(imageNumber, size) {
        if (typeof this.state.order[imageNumber] === "undefined") {
            return false;
        }
        this.filename = this.state.order[imageNumber].filename;
        return this.ajax.getImageUrl(this.state.category, this.state.job, this.filename, size);
    }

    getStatusUrl() {
        return this.ajax.getJobUrl(this.state.category, this.state.job, "/status");
    }

    getLabel(imageNumber, useMagic) {
        useMagic = typeof useMagic === "undefined" ? true : useMagic;
        var label =
            typeof this.state.order[imageNumber] === "undefined" ? null : this.state.order[imageNumber]["label"];
        if (useMagic && null === label) {
            if (typeof this.magicLabelCache[imageNumber] === "undefined") {
                this.magicLabelCache[imageNumber] = MagicLabeler.getLabel(imageNumber, this.getLabel);
            }
            return this.magicLabelCache[imageNumber];
        }
        // Always return a string, even if the internal value is null:
        return label;
    }

    setLabel(imageNumber, text) {
        this.magicLabelCache = []; // clear label cache whenever there is a change
        var newState = this.state;
        if (text !== null && text.length === 0) {
            text = null;
        }
        if (typeof newState.order[imageNumber] === "undefined") {
            return;
        }
        newState.order[imageNumber]["label"] = text;
        this.setState(newState);
        dispatchEvent(new Event("Prep.editted"));
    }

    autonumberFollowingPages() {
        var pages = this.state.order.length - (this.state.currentPage + 1);
        var affected = pages - this.countMagicLabels(this.state.currentPage + 1);
        if (affected > 0) {
            var msg = "You will be clearing " + affected + " label(s). Are you sure?";
            if (!window.confirm(msg)) {
                return;
            }
        }
        for (var i = this.state.currentPage + 1; i < this.state.order.length; i++) {
            this.setLabel(i, null);
        }
    }

    countMagicLabels(startAt) {
        var count = 0;
        for (var i = startAt; i < this.state.order.length; i++) {
            if (null === this.getLabel(i, false)) {
                count++;
            }
        }
        return count;
    }

    deletePage() {
        if (this.state.order.length < 2) {
            alert("You cannot delete the last page in a job.");
            return;
        }
        if (!window.confirm("Are you sure you wish to delete the current page?")) {
            return;
        }
        var imageUrl = this.getImageUrl(this.state.currentPage, "*");
        var parts = imageUrl.split("/");
        var imageFilename = parts[parts.length - 2];
        this.ajax.ajax({
            type: "DELETE",
            url: imageUrl,
            success: function () {
                this.removePages([imageFilename]);
                if (this.state.currentPage >= this.state.order.length) {
                    this.setPage(this.state.currentPage - 1);
                }
                alert("Page deleted!");
            }.bind(this),
            error: function () {
                alert("Unable to delete!");
            },
        });
    }

    loadJob(category, job) {
        var promise = new Promise(
            function (resolve /*, reject*/) {
                this.ajax.getJSON(this.ajax.getJobUrl(category, job), null, function (data) {
                    resolve(data);
                });
            }.bind(this)
        );
        promise
            .then(
                function (data) {
                    data.category = category;
                    data.job = job;
                    data.active = false;
                    data.currentPage = 0;
                    this.setState(data);
                    return new Promise(
                        function (resolve /*, reject*/) {
                            this.ajax.getJSON(this.getStatusUrl(), null, function (data) {
                                resolve(data);
                            });
                        }.bind(this)
                    );
                }.bind(this)
            )
            .then(
                function (status) {
                    if (status.file_problems.deleted.length > 0 || status.file_problems.added.length > 0) {
                        var msg = "";
                        if (status.file_problems.deleted.length > 0) {
                            msg +=
                                status.file_problems.deleted.length +
                                " file(s) have been removed = require(the job since the last edit.\n)";
                            this.removePages(status.file_problems.deleted);
                        }
                        if (status.file_problems.added.length > 0) {
                            msg +=
                                status.file_problems.added.length +
                                " file(s) have been added to the job since the last edit.\n";
                            this.addPages(status.file_problems.added);
                        }
                        alert(msg);
                    }
                    var newState = this.state;
                    newState.active = true;
                    this.setState(newState);
                    dispatchEvent(new Event("Prep.loaded"));
                }.bind(this)
            );
    }

    findNewPagePosition(page, list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].filename >= page) {
                return i;
            }
        }
        return i;
    }

    addPages(pages) {
        var newState = this.state;
        for (var i = 0; i < pages.length; i++) {
            newState.order.splice(this.findNewPagePosition(pages[i], newState.order), 0, {
                filename: pages[i],
                label: null,
            });
        }
        this.setState(newState);
    }

    removePages(pages) {
        var newOrder = [];
        for (var i = 0; i < this.state.order.length; i++) {
            var include = true;
            for (var j = 0; j < pages.length; j++) {
                if (this.state.order[i].filename === pages[j]) {
                    include = false;
                    break;
                }
            }
            if (include) {
                newOrder[newOrder.length] = this.state.order[i];
            }
        }
        var newState = this.state;
        newState.order = newOrder;
        this.setState(newState);
    }

    setPage(p) {
        if (p >= 0 && p < this.state.order.length) {
            var newState = this.state;
            newState.currentPage = p;
            this.setState(newState);
        }
    }

    nextPage() {
        this.setPage(this.state.currentPage + 1);
    }

    prevPage() {
        this.setPage(this.state.currentPage - 1);
    }

    saveMagicLabels() {
        for (var i = 0; i < this.state.order.length; i++) {
            if (null === this.getLabel(i, false)) {
                this.setLabel(i, this.getLabel(i));
            }
        }
    }

    confirmSavedMagicLabels(count) {
        const msg = "You will be saving " + count + " unreviewed, auto-generated label(s). Are you sure?";
        return window.confirm(msg);
    }

    save(publish) {
        var count = this.countMagicLabels(0);
        if (count > 0 && !this.confirmSavedMagicLabels(count)) {
            return;
        }
        this.saveMagicLabels();
        var promise = new Promise(
            function (resolve /*, reject*/) {
                // If the user wants to publish, let's make sure all derivatives are
                // ready! Otherwise we can resolve with no further actions.
                if (publish) {
                    this.ajax.getJSON(this.getStatusUrl(), null, function (data) {
                        resolve(data);
                    });
                } else {
                    resolve(null);
                }
            }.bind(this)
        );
        promise.then(
            function (data) {
                if (publish) {
                    var msg;
                    if (data.derivatives.expected > data.derivatives.processed) {
                        msg =
                            "Derivative images have not been generated yet. Please" +
                            ' go back to the main menu and hit the "build" button' +
                            " for this job before publishing it.";
                        alert(msg);
                        return;
                    }
                    msg =
                        "Are you sure you wish to publish this job? You will not be able" +
                        " to make any further edits.";
                    if (!window.confirm(msg)) {
                        return;
                    }
                }
                this.ajax.ajax({
                    type: "PUT",
                    url: this.ajax.getJobUrl(this.state.category, this.state.job, ""),
                    contentType: "application/json",
                    data: JSON.stringify({ order: this.state.order, published: publish }),
                    success: function () {
                        alert("Success!");
                        window.location.assign("/"); // TODO: Route better?
                        dispatchEvent(new Event("Prep.saved"));
                    },
                    error: function () {
                        alert("Unable to save!");
                    },
                });
            }.bind(this)
        );
    }

    toggleZoom() {
        this.newState = this.state;
        this.newState.zoom = !this.newState.zoom;
        this.setState(this.newState);
    }

    componentDidMount() {
        this.loadJob(this.props.category, this.props.job);
    }

    render() {
        var preview = this.state.zoom ? (
            <PaginatorZoomy img={this.getImageUrl(this.state.currentPage, "large")} />
        ) : (
            <PaginatorPreview img={this.getImageUrl(this.state.currentPage, "medium")} />
        );
        return (
            <div className={this.state.active ? "" : "hidden"} id="paginator">
                <div className="row">
                    <div className="six col">{preview}</div>
                    <div className="six col">
                        <p>
                            {this.state.category} &gt; {this.state.job}
                        </p>
                        <PaginatorControls paginator={this} />
                        <PaginatorList paginator={this} pageCount={this.state.order.length} />
                    </div>
                </div>
            </div>
        );
    }
}

JobPaginator.propTypes = {
    // VuDLPrep
    app: PropTypes.shape({
        activateJobSelector: PropTypes.func,
        ajax: PropTypes.func,
        getImageUrl: PropTypes.func,
        getJobUrl: PropTypes.func,
        getJSON: PropTypes.func,
    }),
    category: PropTypes.string,
    job: PropTypes.string,
};

export default JobPaginator;
