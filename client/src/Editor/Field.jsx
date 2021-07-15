import React from "react";
import PropTypes from "prop-types";

class Field extends React.Component {
    static propTypes = {
        value: PropTypes.object,
        type: PropTypes.string,
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <li className="field flex">
                <div className="flex-1 field__values">{this.props.value}</div>
                <button className="field__remove flex-none btn--none">
                    <i className="ri-edit-line"></i>
                </button>
                <button className="field__remove flex-none btn--none">
                    <i className="ri-delete-bin-2-line"></i>
                </button>
            </li>
        );
    }
}

export default Field;
