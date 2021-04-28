const React = require("react");
const PropTypes = require("prop-types");

class PaginatorPreview extends React.Component {
    render() {
        var img = this.props.img ? <img src={this.props.img} alt="" /> : "";
        return <div className="preview">{img}</div>;
    }
}

PaginatorPreview.propTypes = {
    img: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

module.exports = PaginatorPreview;
