import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import Category from "./Category";
import { ingestApiUrl } from "./routes";

import { useFetchContext } from "./FetchContext";

const JobSelector = () => {
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [categoryComponents, setCategoryComponents] = useState([[], []]);

    const injestApi = async () => {
        try {
            const data = await fetchJSON(ingestApiUrl);
            setCategoryComponents(
                Object.values(data).reduce(
                    (categoryComponents, category) => {
                        categoryComponents[category.jobs.length > 0 ? 0 : 1].push(
                            <Category key={category.category} data={category} />
                        );
                        return categoryComponents;
                    },
                    [[], []]
                )
            );
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        injestApi();
    }, []);

    return <div id="jobSelector">{[...categoryComponents[0], ...categoryComponents[1]]}</div>;
};

JobSelector.propTypes = {
    app: PropTypes.shape({
        fetchJSON: PropTypes.func,
    }),
};

export default JobSelector;
