import React, { useEffect } from "react";
import JobPaginatorZoomToggle from "./JobPaginatorZoomToggle";
import PaginatorControls from "./PaginatorControls";
import PaginatorList from "./PaginatorList";
import { usePaginatorContext } from "../../context/PaginatorContext";
import Link from "next/link";

interface JobPaginatorProps {
    initialCategory: string;
    initialJob: string;
}

const JobPaginator = ({ initialCategory, initialJob }: JobPaginatorProps): React.ReactElement => {
    const {
        state: { category, job },
        action: { loadJob },
    } = usePaginatorContext();

    useEffect(() => {
        loadJob(initialCategory, initialJob);
    }, []);

    return (
        <div id="paginator">
            <div className="row">
                <div className="six col">
                    <JobPaginatorZoomToggle />
                </div>
                <div className="six col">
                    <p>
                        <Link href="/">Main Menu</Link> &gt; <Link href="/paginate">Paginator</Link> &gt; {category}{" "}
                        &gt; {job}
                    </p>
                    <PaginatorControls />
                    <PaginatorList />
                </div>
            </div>
        </div>
    );
};

export default JobPaginator;
