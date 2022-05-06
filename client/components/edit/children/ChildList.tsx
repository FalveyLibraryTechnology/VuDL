import React, { useEffect, useState } from "react";
import { useChildListContext } from "../../../context/ChildListContext";
import Child from "./Child";
import Pagination from "@mui/material/Pagination";

export interface ChildListProps {
    pid?: string;
    pageSize?: number;
}

export const ChildList = ({ pid = "", pageSize = 10 }: ChildListProps): React.ReactElement => {
    const {
        state: { childStorage },
        action: { getChildStorageKey, loadChildrenIntoStorage },
    } = useChildListContext();
    const [page, setPage] = useState<number>(1);
    const key = getChildStorageKey(pid, page, pageSize);
    const notLoaded = typeof childStorage[key] === "undefined";
    useEffect(() => {
        if (notLoaded) {
            loadChildrenIntoStorage(pid, page, pageSize);
        }
    }, []);
    if (notLoaded) {
        return <p>Loading...</p>;
    }
    const children = childStorage[key];
    const childDocs = children.docs;
    const contents =
        childDocs.length > 0 ? (
            childDocs.map((child) => {
                return (
                    <li key={(pid || "root") + "child" + child.id}>
                        <Child pid={child.id} initialTitle={child.title ?? "-"} />
                    </li>
                );
            })
        ) : (
            <p>Empty.</p>
        );
    const pageCount = Math.ceil(children.numFound / pageSize);
    const paginator =
        pageCount > 1 ? (
            <Pagination
                count={pageCount}
                page={page}
                onChange={(e, page) => {
                    setPage(page);
                }}
            />
        ) : (
            ""
        );
    return (
        <>
            {paginator}
            <ul>{contents}</ul>
        </>
    );
};

export default ChildList;
