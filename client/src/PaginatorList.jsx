var React = require('react');
var Thumbnail = require('./Thumbnail');

class PaginatorList extends React.Component{
    constructor(props) {
        super(props);
        this.thumbs = [];
    }

    scrollTo = (thumb) => {
        var listOffset =
            this.pageList.offsetTop +
            (this.thumbs[0].wrapper.offsetTop - this.pageList.offsetTop);
        this.pageList.scrollTop = thumb.offsetTop - listOffset;
    }

    render = () => {
        var pages = [];
        for (var i = 0; i < this.props.pageCount; i++) {
            pages[i] = <Thumbnail ref={(t) => { this.thumbs[i] = t;}} list={this} selected={i === this.props.paginator.state.currentPage} paginator={this.props.paginator} key={i} number={i} />;
        };
        return (
            <div ref={(p) => { this.pageList = p; }} className="pageList">{pages}</div>
        );
    }
};

module.exports = PaginatorList;