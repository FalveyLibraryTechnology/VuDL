import React from "react";
import PropTypes from "prop-types";

import Job from "./Job";

class JobList extends React.Component {
    render() {
        const jobs = this.props.data.map(
            function (job) {
                return (
                    <Job category={this.props.category} key={this.props.category + "|" + job}>
                        {job}
                    </Job>
                );
            }.bind(this)
        );
        return <ul>{jobs}</ul>;
    }
}

JobList.propTypes = {
    category: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.string),
};

export default JobList;
