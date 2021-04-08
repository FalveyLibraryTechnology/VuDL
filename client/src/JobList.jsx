var React = require('react');
var Job = require('./Job');

class JobList extends React.Component{
    render = () => {
        var jobs = this.props.data.map(function (job) {
            return (
                <Job app={this.props.app} category={this.props.category} key={this.props.category + '|' + job}>{job}</Job>
            );
        }.bind(this));
        return (
            <ul>{jobs}</ul>
        );
    }
};

module.exports = JobList;
