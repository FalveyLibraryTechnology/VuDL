const React = require("react");
const PropTypes = require("prop-types");

const PaginatorList = require("./PaginatorList");

class Thumbnail extends React.Component {
    constructor(props) {
        super(props);
        this.wrapper = React.createRef();
        this.selectPage = this.selectPage.bind(this);
    }

    selectPage() {
        this.props.paginator.setPage(this.props.number);
    }

    componentDidUpdate() {
        if (this.props.selected) {
            this.props.list.scrollTo(this.wrapper);
        }
    }

    render() {
        var label = this.props.paginator.getLabel(this.props.number);
        // check for magic labels:
        var labelClass = "label" + (null === this.props.paginator.getLabel(this.props.number, false) ? " magic" : "");
        var myClass = "thumbnail" + (this.props.selected ? " selected" : "");
        return (
            <div onClick={this.selectPage} className={myClass} ref={this.wrapper}>
                <img alt="" src={this.props.paginator.getImageUrl(this.props.number, "thumb")} />
                <div className="number">{this.props.number + 1}</div>
                <div className={labelClass}>{label}</div>
            </div>
        );
    }
}

Thumbnail.propTypes = {
    // TODO: list and paginator?
    list: PropTypes.shape({ type: PropTypes.oneOf([PaginatorList]) }),
    number: PropTypes.number,
    paginator: PropTypes.shape({ type: PropTypes.oneOf([PaginatorList]) }),
    selected: PropTypes.bool,
};

module.exports = Thumbnail;
