import React from "react";
import { BrowserRouter } from "react-router-dom";
import PropTypes from "prop-types";

import Routes from "./Routes";
import LogoutButton from "./LogoutButton";

<<<<<<< HEAD
import CreateObject from "./Editor/CreateObject";

class VuDLPrep extends React.Component {
    constructor(props) {
        super(props);
        this.ajax = AjaxHelper.getInstance();
    }

    render() {
        return (
            <div>
                <div className="logout">
                    <LogoutButton />
                </div>
                <BrowserRouter>
                    <Switch>
                        <Route exact path="/">
                            <MainMenu />
                        </Route>
                        <Route exact path="/paginate">
                            <JobSelector
                                app={this}
                                ref={(s) => {
                                    this.selector = s;
                                }}
                            />
                        </Route>
                        <Route path="/editor/object/new">
                            <CreateObject />
                        </Route>
                        <Route path="/paginate/:category/:job">
                            <JobPaginatorHook />
                        </Route>
                        <Route exact path="/pdf">
                            <PdfGenerator />
                        </Route>
                        <Route exact path="/solr">
                            <SolrIndexer />
                        </Route>
                    </Switch>
                </BrowserRouter>
=======
const VuDLPrep = () => {
    return (
        <div>
            <div className="logout">
                <LogoutButton />
>>>>>>> dev
            </div>
            <BrowserRouter>
                <Routes />
            </BrowserRouter>
        </div>
    );
};

VuDLPrep.propTypes = {
    logoutUrl: PropTypes.string,
    token: PropTypes.string,
};

export default VuDLPrep;
