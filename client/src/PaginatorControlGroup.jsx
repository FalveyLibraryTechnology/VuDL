const React = require("react");
const PropTypes = require("prop-types");

class PaginatorControlGroup extends React.Component {
    render() {
        var buttons = this.props.children.map(
            function (item) {
                var callback = function () {
                    this.props.callback(item);
                }.bind(this);
                return (
                    <button onClick={callback} key={item}>
                        {item}
                    </button>
                );
            }.bind(this)
        );
        return (
            <div className="group" id={this.props.label}>
                {buttons}
            </div>
        );
    }
}

PaginatorControlGroup.propTypes = {
    callback: PropTypes.func,
    children: PropTypes.arrayOf(PropTypes.string),
    label: PropTypes.string,
};

module.exports = PaginatorControlGroup;
