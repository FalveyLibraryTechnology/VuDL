import React from "react";
import { useRouter } from "next/router";
import JobPaginator from "../../../components/paginate/JobPaginator";

export default function CategoryJob() {
    const router = useRouter();
    if (router.isReady) {
        const { category, job } = router.query;
        return <JobPaginator initialCategory={category} initialJob={job} />;
    }
    return null;
}
