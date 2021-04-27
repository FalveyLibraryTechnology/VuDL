const React = require("react");
import PropTypes from "prop-types";

const Job = require("./Job");
const VuDLPrep = require("./VuDLPrep");

class JobList extends React.Component {
    render() {
        const jobs = this.props.data.map(
            function (job) {
                return (
                    <Job app={this.props.app} category={this.props.category} key={this.props.category + "|" + job}>
                        {job}
                    </Job>
                );
            }.bind(this)
        );
        return <ul>{jobs}</ul>;
    }
}

JobList.propTypes = {
    app: PropTypes.instanceOf(VuDLPrep),
    category: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.string),
};

module.exports = JobList;
