const React = require("react");
const PropTypes = require("prop-types");

const Thumbnail = require("./Thumbnail");

class PaginatorList extends React.Component {
    constructor(props) {
        super(props);
        this.pageList = React.createRef();
    }

    scrollTo(thumb) {
        var listOffset = this.pageList.offsetTop + (this.firstThumb.wrapper.offsetTop - this.pageList.offsetTop);
        // TODO: this doesn't seem to be working:
        this.pageList.current.scrollTop = thumb.offsetTop - listOffset;
    }

    render() {
        var pages = [];
        for (let i = 0; i < this.props.pageCount; i++) {
            pages[i] = (
                <Thumbnail
                    ref={(t) => {
                        if (i === 0 && t !== null) {
                            this.firstThumb = t;
                        }
                    }}
                    list={this}
                    selected={i === this.props.paginator.state.currentPage}
                    paginator={this.props.paginator}
                    key={i}
                    number={i}
                />
            );
        }
        return (
            <div ref={this.pageList} className="pageList">
                {pages}
            </div>
        );
    }
}

PaginatorList.propTypes = {
    // JobPaginator
    paginator: PropTypes.shape({
        state: PropTypes.shape({
            currentPage: PropTypes.number,
        }),
    }),
    pageCount: PropTypes.number,
};

module.exports = PaginatorList;
