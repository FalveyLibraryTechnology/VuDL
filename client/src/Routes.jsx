import React from "react";
import { Switch, Route, useParams } from "react-router-dom";

import JobSelector from "./JobSelector";
import JobPaginator from "./JobPaginator";
import MainMenu from "./MainMenu";
import PdfGenerator from "./PdfGenerator";
import SolrIndexer from "./SolrIndexer";

const JobPaginatorHook = () => {
    const { category, job } = useParams();
    return <JobPaginator category={category} job={job} />;
};

const Routes = () => {
    return (
        <Switch>
            <Route exact path="/">
                <MainMenu />
            </Route>
            <Route exact path="/paginate">
                <JobSelector />
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
    );
};

export default Routes;
