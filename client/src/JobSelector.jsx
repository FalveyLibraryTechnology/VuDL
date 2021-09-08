import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import Category from "./Category";
import AjaxHelper from "./AjaxHelper";

const JobSelector = () => {
    const [data, setData] = useState([]);
    const ajax = AjaxHelper.getInstance();
    const injestApi = () => {
        ajax.getJSON(ajax.ingestApiUrl, null, (data) => {
            setData(data);
        });
    };
    useEffect(() => {
        injestApi();
    }, []);

    const categoryComponents = Object.values(data).reduce(
        (categoryComponents, category) => {
            categoryComponents[category.jobs.length > 0 ? 0 : 1].push(
                <Category key={category.category} data={category} />
            );
            return categoryComponents;
        },
        [[], []]
    );

    return <div id="jobSelector">{[...categoryComponents[0], ...categoryComponents[1]]}</div>;
};

JobSelector.propTypes = {
    app: PropTypes.shape({
        getJSON: PropTypes.func,
    }),
};

export default JobSelector;
