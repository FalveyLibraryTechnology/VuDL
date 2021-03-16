var React = require('react');
var Thumbnail = require('./Thumbnail');

class PaginatorList extends React.Component{
    scrollTo = (thumb) => {
        var listOffset =
            this.refs.pageList.offsetTop +
            (this.refs.thumb0.refs.wrapper.offsetTop - this.refs.pageList.offsetTop);
        this.refs.pageList.scrollTop = thumb.offsetTop - listOffset;
    }

    render = () => {
        var pages = [];
        for (var i = 0; i < this.props.pageCount; i++) {
            pages[i] = <Thumbnail ref={"thumb" + i} list={this} selected={i === this.props.paginator.state.currentPage} paginator={this.props.paginator} key={i} number={i} />;
        };
        return (
            <div ref="pageList" className="pageList">{pages}</div>
        );
    }
};

module.exports = PaginatorList;