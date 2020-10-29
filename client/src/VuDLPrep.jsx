import $ from 'jquery';

var React = require('react');
var JobSelector = require('./JobSelector');
//var JobPaginator = require('./JobPaginator')

class VuDLPrep extends React.Component{
    activateJobSelector() {
        this.refs.paginator.setState(this.refs.paginator.getInitialState());
        this.refs.selector.show();
    }

    getImageUrl(category, job, filename, size) {
        return this.getJobUrl(
            category, job,
            '/' + encodeURIComponent(filename) + '/' + encodeURIComponent(size)
        );
    }

    getJobUrl(category, job, extra) {
        return this.props.url + '/' + encodeURIComponent(category) + '/'
            + encodeURIComponent(job) + extra;
    }

    selectJob(category, job) {
        this.refs.selector.hide();
        this.refs.paginator.loadJob(category, job);
    }

    ajax(params) {
        params.beforeSend = function (xhr) {
            xhr.setRequestHeader('Authorization', 'Token ' + this.props.token);
        }.bind(this);
        $.ajax(params);
    }

    getJSON(url, data, success) {
        this.ajax({
          dataType: "json",
          url: url,
          data: data,
          success: success
        });
    }
// <JobPaginator app={this} ref="paginator" />
    render() {
        var logout = this.props.logoutUrl
            ? <div className="logout"><a href={this.props.logoutUrl} className="button">Log Out</a></div>
            : '';
        return (
            <div>
                {logout}
                <JobSelector app={this} ref="selector" onJobSelect={this.selectJob} url={this.props.url} />
            </div>
        );
    }
};

export default VuDLPrep;
//module.exports = VuDLPrep;