import React from "react";
import PropTypes from "prop-types";

import Job from "./Job";
import VuDLPrep from "./VuDLPrep";

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
    app: PropTypes.shape({ type: PropTypes.oneOf([VuDLPrep]) }),
    category: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.string),
};

export default JobList;
