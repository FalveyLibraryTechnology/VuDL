import React, { useEffect } from "react";

import JobClickable from "./JobClickable";

import useJob from "../../hooks/useJob";

interface JobProps {
    category: string;
    children: string;
}

const Job = ({ category, children }: JobProps): React.ReactElement => {
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

export default Job;
