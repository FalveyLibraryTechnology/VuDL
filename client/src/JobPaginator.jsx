import React from "react";
import PropTypes from "prop-types";

import { paginatorStore, initPaginatorStore, getLabel, setLabel, getImageUrl, getStatusUrl } from "./paginator-store";

import AjaxHelper from "./AjaxHelper";
import PaginatorControls from "./PaginatorControls";
import PaginatorList from "./PaginatorList";
import PaginatorPreview from "./PaginatorPreview";
import PaginatorZoomy from "./PaginatorZoomy";

class JobPaginator extends React.Component {
    constructor(props) {
        super(props);
        this.active = false;
        this.order = [];
        this.ajax = AjaxHelper.getInstance();
        // BIND
        this.autonumberFollowingPages = this.autonumberFollowingPages.bind(this);
        this.deletePage = this.deletePage.bind(this);
    }

    componentDidMount() {
        this.loadJob(this.props.category, this.props.job);

        paginatorStore.subscribe(({ active, currentPage, order, zoom }, changed) => {
            if (!this.active || changed == "active") {
                this.active = active;
            }
            if (!this.order || changed == "order") {
                this.order = order;
            }
            if (!this.preview || changed == "currentPage" || changed == "zoom") {
                this.preview = zoom ? (
                    <PaginatorZoomy img={getImageUrl(currentPage, "large")} />
                ) : (
                    <PaginatorPreview img={getImageUrl(currentPage, "medium")} />
                );
            }
            this.forceUpdate();
        });
    }

    autonumberFollowingPages() {
        var pages = this.order.length - (this.state.currentPage + 1);
        var affected = pages - this.countMagicLabels(this.state.currentPage + 1);
        if (affected > 0) {
            var msg = "You will be clearing " + affected + " label(s). Are you sure?";
            if (!window.confirm(msg)) {
                return;
            }
        }
        for (var i = this.state.currentPage + 1; i < this.order.length; i++) {
            setLabel(i, null);
        }
    }

    countMagicLabels(startAt) {
        var count = 0;
        for (var i = startAt; i < this.order.length; i++) {
            if (null === getLabel(i, false)) {
                count++;
            }
        }
        return count;
    }

    deletePage() {
        if (this.order.length < 2) {
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
                if (this.state.currentPage >= this.order.length) {
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
        initPaginatorStore({ category, job });

        this.ajax
            .getJSONPromise(this.ajax.getJobUrl(category, job))
            .then(
                function (data) {
                    initPaginatorStore(data);
                    return this.ajax.getJSONPromise(getStatusUrl());
                }.bind(this)
            )
            .then(
                function (status) {
                    if (status.file_problems.deleted.length > 0 || status.file_problems.added.length > 0) {
                        var msg = "";
                        if (status.file_problems.deleted.length > 0) {
                            msg +=
                                status.file_problems.deleted.length +
                                " file(s) have been removed = require(the job since the last edit.)\n";
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
                    paginatorStore.setKey("active", true);
                    // TODO: if used, subscribe to nanostores
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
        for (var i = 0; i < this.order.length; i++) {
            var include = true;
            for (var j = 0; j < pages.length; j++) {
                if (this.order[i].filename === pages[j]) {
                    include = false;
                    break;
                }
            }
            if (include) {
                newOrder[newOrder.length] = this.order[i];
            }
        }
        var newState = this.state;
        newState.order = newOrder;
        this.setState(newState);
    }

    saveMagicLabels() {
        for (var i = 0; i < this.order.length; i++) {
            if (null === getLabel(i, false)) {
                setLabel(i, getLabel(i));
            }
        }
    }

    confirmSavedMagicLabels(count) {
        const msg = "You will be saving " + count + " unreviewed, auto-generated label(s). Are you sure?";
        return window.confirm(msg);
    }

    save(publish = false) {
        var count = this.countMagicLabels(0);
        if (count > 0 && !this.confirmSavedMagicLabels(count)) {
            return;
        }
        this.saveMagicLabels();
        if (!publish) {
            return null;
        }
        this.ajax.getJSONPromise(this.getStatusUrl()).then(
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
                    data: JSON.stringify({ order: this.order, published: publish }),
                    success: function () {
                        alert("Success!");
                        window.location.assign("/paginate"); // TODO: Route better?
                        dispatchEvent(new Event("Prep.saved"));
                    },
                    error: function () {
                        alert("Unable to save!");
                    },
                });
            }.bind(this)
        );
    }

    render() {
        return (
            <div className={this.active ? "" : "hidden"} id="paginator">
                <div className="row">
                    <div className="six col">{this.preview}</div>
                    <div className="six col">
                        <p>
                            {this.props.category} &gt; {this.props.job}
                        </p>
                        <PaginatorControls paginator={this} />
                        <PaginatorList paginator={this} pageCount={this.order.length} />
                    </div>
                </div>
            </div>
        );
    }
}

JobPaginator.propTypes = {
    category: PropTypes.string,
    job: PropTypes.string,
};

export default JobPaginator;
