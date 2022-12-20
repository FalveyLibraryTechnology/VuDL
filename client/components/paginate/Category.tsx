import React from "react";
import { useSessionStorage } from "../../util/sessionStorage";
import JobList from "./JobList";

interface CategoryProps {
    data: {
        category: string;
        jobs: Array<string>;
    };
}

const Category = ({ data }: CategoryProps): React.ReactElement => {
    const { jobs, category } = data;
    const [open, setOpen] = useSessionStorage("open-" + category, false);
    const toggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!open);
    };
    return (
        <div className="jobCategory">
            {jobs.length ? (
                <h2>
                    <button className="btn-link" onClick={toggle}>
                        {open ? "[–]" : "[+]"}
                    </button>{" "}
                    {category}
                </h2>
            ) : (
                <h2>{category + " [no jobs]"}</h2>
            )}
            {open && <JobList category={category} data={jobs} />}
        </div>
    );
};

export default Category;
