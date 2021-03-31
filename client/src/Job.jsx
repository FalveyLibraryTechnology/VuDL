var React = require('react');

class Job extends React.Component{
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount = () => {
        this.updateStatus();
    }

    handleClick = (clickWarning) => {
        if (clickWarning) {
            if (!window.confirm(clickWarning)) {
                return;
            }
        }
        this.props.onJobSelect(this.props.category, this.props.children);
    }

    getDerivUrl = () => {
        return this.props.app.getJobUrl(
            this.props.category, this.props.children, '/derivatives'
        );
    }

    getIngestUrl = () => {
        return this.props.app.getJobUrl(
            this.props.category, this.props.children, '/ingest'
        );
    }

    getStatusUrl = () => {
        return this.props.app.getJobUrl(
            this.props.category, this.props.children, '/status'
        );
    }

    buildDerivatives = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.props.app.ajax({
            type: 'PUT',
            url: this.getDerivUrl(),
            contentType: 'application/json',
            data: '{}',
            success: function() { this.updateStatus(); }.bind(this),
        });
    }

    ingest = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Are you sure? This will put a load on the server!")) {
            return;
        }
        this.props.app.ajax({
            type: 'PUT',
            url: this.getIngestUrl(),
            contentType: 'application/json',
            data: '{}',
            success: function() { this.updateStatus(); }.bind(this),
        });
    }

    updateStatus = (e) => {
        if (typeof e !== 'undefined') {
            e.stopPropagation();
        }
        this.props.app.getJSON(this.getStatusUrl(), null, function (data) {
            this.setState(data);
            if (this.state.derivatives.building || (typeof this.state.ingest_info !== 'undefined' && this.state.ingest_info.length > 0)) {
                setTimeout(this.updateStatus, 1000);
            }
        }.bind(this));
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

    render = () => {
        var clickable = false;
        var clickWarning = false;
        var action = '';
        var statusText = [];
        var ingestInfo = '';
        if (typeof this.state.ingest_info !== "undefined") {
            ingestInfo = this.state.ingest_info;
        }
        if (typeof this.state.derivatives !== 'undefined') {
            statusText.push(this.getAgeString(this.state.minutes_since_upload));
            if (this.state.derivatives.expected === 0 && this.state.documents === 0 && this.state.audio === 0) {
                statusText.push('empty job');
            } else {
                var pageCount = parseInt(this.state.derivatives.expected / 3);
                if (this.state.documents > 0) {
                    statusText.push(this.state.documents + (this.state.documents > 1 ? ' documents' : ' document'));
                }
                if (this.state.audio > 0) {
                    statusText.push(this.state.audio + (this.state.audio > 1 ? ' audio' : ' audio'));
                }
                statusText.push(pageCount + (pageCount > 1 ? ' pages' : ' page'));
                if (this.state.minutes_since_upload < 10) {
                    var minutes = this.state.minutes_since_upload;
                    clickWarning = "This job was updated " + minutes + " minute"
                        + (minutes !== 1 ? 's' : '') + " ago. Please do not edit it"
                        + " unless you are sure all uploads have fully completed.";
                }
                if (this.state.published) {
                    if (this.state.ingesting) {
                        statusText.push('ingesting now; cannot be edited');
                    } else {
                        statusText.push('queued for ingestion; cannot be edited');
                        action = <button onClick={this.ingest}>ingest now</button>
                    }
                } else if (this.state.derivatives.expected === this.state.derivatives.processed) {
                    statusText.push('ready');
                    clickable = true;
                } else {
                    if (!this.state.derivatives.building) {
                        action = <button onClick={this.buildDerivatives}>build derivatives</button>
                    }
                    var percentDone = (100 * (this.state.derivatives.processed / this.state.derivatives.expected));
                    statusText.push('derivatives: ' + percentDone.toFixed(2) + '% built');
                    clickable = true;
                }
            }
        } else {
            statusText.push('loading...');
        }

        // TODO: react-router
        let hashurl = "#/" + this.props.category + "/" + this.props.children;
        var link = clickable
            ? <a href={hashurl} onClick={function () { this.handleClick(clickWarning); }.bind(this)}>{this.props.children}</a>
            : <span>{this.props.children}</span>;
        return (
            <li>
                {link}
                {' [' + statusText.join(', ') + '] '}
                {action}
                <br />
                {ingestInfo}
            </li>
        );
    }
};

module.exports = Job;