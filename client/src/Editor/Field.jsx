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
                <button className="field__add flex-none btn--none">
                    <i className="ri-add-fill"></i>
                </button>
                <button className="field__remove flex-none btn--none">
                    <i className="ri-subtract-fill"></i>
                </button>
                <div className="flex-1 field__values">{this.props.value}</div>
            </li>
        );
    }
}

export default Field;
