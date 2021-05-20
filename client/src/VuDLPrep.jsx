import React from "react";
import { BrowserRouter, Switch, Route, useParams } from "react-router-dom";
import PropTypes from "prop-types";

import AjaxHelper from "./AjaxHelper";
import JobSelector from "./JobSelector";
import JobPaginator from "./JobPaginator";

class VuDLPrep extends React.Component {
    constructor(props) {
        super(props);
        this.ajax = AjaxHelper.getInstance();
    }

    render() {
        var logout = this.ajax.logoutUrl ? (
            <div className="logout">
                <a href={this.ajax.logoutUrl} className="button">
                    Log Out
                </a>
            </div>
        ) : (
            ""
        );
        return (
            <div>
                {logout}
                <BrowserRouter>
                    <Switch>
                        <Route exact path="/">
                            <JobSelector
                                app={this}
                                ref={(s) => {
                                    this.selector = s;
                                }}
                            />
                        </Route>
                        <Route path="/paginate/:category/:job">
                            <JobPaginatorHook />
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        );
    }
}

function JobPaginatorHook() {
    let { category, job } = useParams();
    return <JobPaginator category={category} job={job} />;
}

VuDLPrep.propTypes = {
    logoutUrl: PropTypes.string,
    token: PropTypes.string,
};

export default VuDLPrep;
