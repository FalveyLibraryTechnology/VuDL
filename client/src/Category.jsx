var React = require('react');
var JobList = require('./JobList');

class Category extends React.Component{
    constructor(props) {
        super(props);
        this.state = {open: this.checkStorage()};
    }

    checkStorage = () => {
        return typeof(window.sessionStorage) !== "undefined"
            ? "true" === window.sessionStorage.getItem("open-" + this.props.data.category)
            : false;
    }

    setStorage = (isOpen) => {
        if (typeof(window.sessionStorage) !== "undefined") {
            window.sessionStorage.setItem("open-" + this.props.data.category, isOpen ? "true" : "false")
        }
    }

    toggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setStorage(!this.state.open);
        this.setState({open: !this.state.open});
    }

    render = () => {
        var header = this.props.data.jobs.length
            ? <h2><button className="btn-link" onClick={this.toggle}>{(this.state.open ? '[–]' : '[+]')}</button> {this.props.data.category}</h2>
            : <h2>{this.props.data.category + ' [no jobs]'}</h2>
        var joblist = this.state.open
            ? <JobList app={this.props.app} onJobSelect={this.props.onJobSelect} category={this.props.data.category} data={this.props.data.jobs} />
            : '';
        return (
            <div className="jobCategory">
                {header}
                {joblist}
            </div>
        );
    }
};

module.exports = Category;