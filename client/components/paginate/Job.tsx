import React, { useEffect } from "react";
import PropTypes from "prop-types";
import JobClickable from "./JobClickable";

import useJob from "../../hooks/useJob";

const Job = ({ category, children }) => {
    const {
        state: { statusText, clickWarning, action, ingestInfo, clickable, timeoutRef },
        action: { updateStatus },
    } = useJob({ category, children });

    useEffect(() => {
        updateStatus();
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <li>
            <JobClickable category={category} clickable={clickable} clickWarning={clickWarning}>
                {children}
            </JobClickable>
            {" [" + statusText.join(", ") + "] "}
            {action && <button onClick={action.onClick}>{action.text}</button>}
            <br />
            {ingestInfo}
        </li>
    );
};

Job.propTypes = {
    category: PropTypes.string,
    children: PropTypes.string,
};

export default Job;
