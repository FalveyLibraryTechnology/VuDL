import React from "react";

import { usePaginatorContext } from "../../context/PaginatorContext";
import PaginatorPreview from "./PaginatorPreview";
import PaginatorZoomy from "./PaginatorZoomy";

const JobPaginatorZoomToggle = () => {
    const {
        state: { order, zoom, currentPage },
        action: { getJobImageUrl },
    } = usePaginatorContext();

    if (order.length < 1) {
        return <div>Preview not available.</div>;
    }
    return zoom ? (
        <PaginatorZoomy img={getJobImageUrl(order[currentPage], "large")} />
    ) : (
        <PaginatorPreview img={getJobImageUrl(order[currentPage], "medium")} />
    );
};

export default JobPaginatorZoomToggle;
