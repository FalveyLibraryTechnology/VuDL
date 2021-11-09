import React from "react";
import { Switch, Route, useParams } from "react-router-dom";

import EditHome from "./Editor/EditHome";
import JobSelector from "./JobSelector";
import JobPaginator from "./JobPaginator";
import MainMenu from "./MainMenu";
import ObjectEditor from "./Editor/ObjectEditor";
import PdfGenerator from "./PdfGenerator";
import SolrIndexer from "./SolrIndexer";
import CreateObject from "./Editor/CreateObject";

const JobPaginatorHook = () => {
    const { category, job } = useParams();
    return <JobPaginator initialCategory={category} initialJob={job} />;
};

const ObjectEditorHook = () => {
    const { pid } = useParams();
    return <ObjectEditor pid={pid} key={"object-editor-" + pid} />;
};

const Routes = () => {
    return (
        <Switch>
            <Route exact path="/">
                <MainMenu />
            </Route>
            <Route exact path="/edit">
                <EditHome />
            </Route>
            <Route path="/edit/object/:pid">
                <ObjectEditorHook />
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
            <Route path="/editor/object/new">
                <CreateObject allowNoParentPid={true} />
            </Route>
        </Switch>
    );
};

export default Routes;
