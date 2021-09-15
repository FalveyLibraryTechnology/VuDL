import React from "react";
import { Link } from "react-router-dom";

const MainMenu = () => {
    return (
        <div className="main-menu">
            <h1 className="main-menu-heading">VuDL Admin</h1>
            <h2 className="main-menu-core-functions-heading">Core Functions</h2>
            <ul className="main-menu-core-functions-list">
                <li>
                    <Link to="/paginate">Job Paginator</Link>
                </li>
                <li>Object Editor [coming soon]</li>
            </ul>
            <h2 className="main-menu-other-tools-heading">Other Tools</h2>
            <ul className="main-menu-other-tools-list">
                <li>
                    <Link to="/pdf">PDF Generator</Link>
                </li>
                <li>
                    <Link to="/solr">Solr Indexer</Link>
                </li>
            </ul>
            <h2>Object Editor Pieces</h2>
            <ul>
                <li>
                    <Link to="/editor/object/new">Create Object</Link>
                </li>
            </ul>
        </div>
    );
};

export default MainMenu;
