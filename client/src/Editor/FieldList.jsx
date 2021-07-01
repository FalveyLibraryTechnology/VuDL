import React from "react";
import PropTypes from "prop-types";

import Field from "./Field";

class FieldList extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        type: PropTypes.string,
        values: PropTypes.arrayOf(PropTypes.object),
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="field-list">
                <h3>{this.props.title}</h3>
                {this.props.values.map((field, i) => (
                    <Field key={"field" + i} value={field} />
                ))}
            </div>
        );
    }
}

export default FieldList;
