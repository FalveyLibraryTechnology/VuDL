import React from "react";
import Job from "./Job";

interface JobListProps {
    category: string;
    data: Array<string>;
}

const JobList = ({ category, data }: JobListProps): React.ReactElement => {
    return (
        <ul>
            {data.map((job) => (
                <Job category={category} key={category + "|" + job}>
                    {job}
                </Job>
            ))}
        </ul>
    );
};

export default JobList;
