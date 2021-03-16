var React = require('react');

class PaginatorPreview extends React.Component{
    render = () => {
        var img = this.props.img
            ? <img src={this.props.img} alt="" />
            : '';
        return (
            <div className="preview">
                {img}
            </div>
        );
    }
};

module.exports = PaginatorPreview;