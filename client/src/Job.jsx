import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import AjaxHelper from "./AjaxHelper";

class Job extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.ajax = AjaxHelper.getInstance();
        // BIND
        this.buildDerivatives = this.buildDerivatives.bind(this);
        this.ingest = this.ingest.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
    }

    componentDidMount() {
        this.updateStatus();
    }

    handleClick(e, clickWarning) {
        if (clickWarning && !window.confirm(clickWarning)) {
            e.preventDefault();
            return false;
        }
    }

    getDerivUrl() {
        return this.ajax.getJobUrl(this.props.category, this.props.children, "/derivatives");
    }

    getIngestUrl() {
        return this.ajax.getJobUrl(this.props.category, this.props.children, "/ingest");
    }

    getStatusUrl() {
        return this.ajax.getJobUrl(this.props.category, this.props.children, "/status");
    }

    buildDerivatives(e) {
        e.preventDefault();
        e.stopPropagation();
        this.ajax.ajax({
            type: "PUT",
            url: this.getDerivUrl(),
            contentType: "application/json",
            data: "{}",
            success: function () {
                this.updateStatus();
            }.bind(this),
        });
    }

    ingest(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Are you sure? This will put a load on the server!")) {
            return;
        }
        this.ajax.ajax({
            type: "PUT",
            url: this.getIngestUrl(),
            contentType: "application/json",
            data: "{}",
            success: function () {
                this.updateStatus();
            }.bind(this),
        });
    }

    updateStatus(e) {
        if (typeof e !== "undefined") {
            e.stopPropagation();
        }
        this.ajax.getJSON(
            this.getStatusUrl(),
            null,
            function (data) {
                this.setState(data);
                if (
                    this.state.derivatives.building ||
                    (typeof this.state.ingest_info !== "undefined" && this.state.ingest_info.length > 0)
                ) {
                    setTimeout(this.updateStatus, 1000);
                }
            }.bind(this)
        );
    }

    getAgeString(minutes) {
        if (1 === minutes) {
            return "1 minute old";
        }
        if (minutes < 60) {
            return minutes + " minutes old";
        }
        var hours = Math.floor(minutes / 60);
        if (1 === hours) {
            return "1 hour old";
        }
        if (hours < 24) {
            return hours + " hours old";
        }
        var days = Math.floor(hours / 24);
        if (1 === days) {
            return "1 day old";
        }
        if (days < 7) {
            return days + " days old";
        }
        var weeks = Math.floor(days / 7);
        if (1 === weeks) {
            return "1 week old";
        }
        if (weeks < 52) {
            return weeks + " weeks old";
        }
        var years = Math.floor(weeks / 52);
        if (1 === years) {
            return "1 year old";
        }
        return years + " years old";
    }

    render() {
        var clickable = false;
        var clickWarning = false;
        var action = "";
        var statusText = [];
        var ingestInfo = "";
        if (typeof this.state.ingest_info !== "undefined") {
            ingestInfo = this.state.ingest_info;
        }
        if (typeof this.state.derivatives !== "undefined") {
            statusText.push(this.getAgeString(this.state.minutes_since_upload));
            if (this.state.derivatives.expected === 0 && this.state.documents === 0 && this.state.audio === 0) {
                statusText.push("empty job");
            } else {
                var pageCount = parseInt(this.state.derivatives.expected / 3);
                if (this.state.documents > 0) {
                    statusText.push(this.state.documents + (this.state.documents > 1 ? " documents" : " document"));
                }
                if (this.state.audio > 0) {
                    statusText.push(this.state.audio + (this.state.audio > 1 ? " audio" : " audio"));
                }
                statusText.push(pageCount + (pageCount > 1 ? " pages" : " page"));
                if (this.state.minutes_since_upload < 10) {
                    var minutes = this.state.minutes_since_upload;
                    clickWarning =
                        "This job was updated " +
                        minutes +
                        " minute" +
                        (minutes !== 1 ? "s" : "") +
                        " ago. Please do not edit it" +
                        " unless you are sure all uploads have fully completed.";
                }
                if (this.state.published) {
                    if (this.state.ingesting) {
                        statusText.push("ingesting now; cannot be edited");
                    } else {
                        statusText.push("queued for ingestion; cannot be edited");
                        action = <button onClick={this.ingest}>ingest now</button>;
                    }
                } else if (this.state.derivatives.expected === this.state.derivatives.processed) {
                    statusText.push("ready");
                    clickable = true;
                } else {
                    if (!this.state.derivatives.building) {
                        action = <button onClick={this.buildDerivatives}>build derivatives</button>;
                    }
                    var percentDone = 100 * (this.state.derivatives.processed / this.state.derivatives.expected);
                    statusText.push("derivatives: " + percentDone.toFixed(2) + "% built");
                    clickable = true;
                }
            }
        } else {
            statusText.push("loading...");
        }

        var link = clickable ? (
            <Link
                to={`/paginate/${this.props.category}/${this.props.children}`}
                onClick={function (e) {
                    return this.handleClick(e, clickWarning);
                }.bind(this)}
            >
                {this.props.children}
            </Link>
        ) : (
            <span>{this.props.children}</span>
        );
        return (
            <li>
                {link}
                {" [" + statusText.join(", ") + "] "}
                {action}
                <br />
                {ingestInfo}
            </li>
        );
    }
}

Job.propTypes = {
    category: PropTypes.string,
    children: PropTypes.string,
};

export default Job;
