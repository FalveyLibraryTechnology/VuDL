import $ from 'jquery';
import {
  BrowserRouter,
  Switch,
  Route,
  useParams
} from "react-router-dom";

import React from 'react';
import JobSelector from './JobSelector';
import JobPaginator from './JobPaginator';

class VuDLPrep extends React.Component{
    activateJobSelector = () => {
        this.paginator.setState(this.paginator.getInitialState());
        this.selector.show();
    }

    getImageUrl = (category, job, filename, size) => {
        return this.getJobUrl(
            category, job,
            '/' + encodeURIComponent(filename) + '/' + encodeURIComponent(size)
        );
    }

    getJobUrl = (category, job, extra) => {
        return this.props.url + '/' + encodeURIComponent(category) + '/'
            + encodeURIComponent(job) + extra;
    }

    selectJob = (category, job) => {
        this.selector.hide();
        this.paginator.loadJob(category, job);
    }

    ajax = (params) => {
        params.beforeSend = function (xhr) {
            xhr.setRequestHeader('Authorization', 'Token ' + this.props.token);
        }.bind(this);
        $.ajax(params);
    }

    getJSON = (url, data, success) => {
        this.ajax({
          dataType: "json",
          url: url,
          data: data,
          success: success
        });
    }
    render = () => {
        var logout = this.props.logoutUrl
            ? <div className="logout"><a href={this.props.logoutUrl} className="button">Log Out</a></div>
            : '';
        return (
            <div>
                {logout}
                <BrowserRouter>
                    <Switch>
                        <Route exact path="/">
                            <JobSelector app={this} ref={(s) => { this.selector = s; }} onJobSelect={this.selectJob} url={this.props.url} />
                        </Route>
                        <Route path="/:category/:job">
                            <JobPaginatorHook app={this}/>
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        );
    }
};

function JobPaginatorHook({ app }) {
    let { category, job } = useParams();
    return <JobPaginator app={app} category={category} job={job} />
}

export default VuDLPrep;