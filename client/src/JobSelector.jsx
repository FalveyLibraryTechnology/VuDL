import React from "react";

import Category from "./Category";
import AjaxHelper from "./AjaxHelper";

class JobSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = { active: true, data: [] };
        this.ajax = AjaxHelper.getInstance();
    }

    hide() {
        var newState = this.state;
        newState.active = false;
        this.setState(newState);
    }

    show() {
        this.setState({ active: true, data: [] });
        this.componentDidMount();
    }

    componentDidMount() {
        this.ajax.getJSON(
            this.ajax.ingestApiUrl,
            null,
            function (data) {
                this.setState({ active: true, data: data });
            }.bind(this)
        );
    }

    render() {
        var categories = [];
        var empty_categories = [];
        for (var i in this.state.data) {
            var category = this.state.data[i];
            var element = <Category key={category.category} data={category} />;
            if (category.jobs.length > 0) {
                categories[categories.length] = element;
            } else {
                empty_categories[empty_categories.length] = element;
            }
        }
        return (
            <div className={this.state.active ? "" : "hidden"} id="jobSelector">
                {categories}
                {empty_categories}
            </div>
        );
    }
}

export default JobSelector;
