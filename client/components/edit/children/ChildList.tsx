import React, { useEffect, useState } from "react";
import { useFetchContext } from "../../../context/FetchContext";
import { getObjectChildrenUrl } from "../../../util/routes";
import Child from "./Child";
import Pagination from "@mui/material/Pagination";

export interface ChildListProps {
    pid: string;
    pageSize: number;
}
interface Children {
    numFound: number;
    start: number;
    docs: Record<string, string>[];
}

export const ChildList = ({ pid = "", pageSize = 10 }: ChildListProps): React.ReactElement => {
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [children, setChildren] = useState<Children>({
        numFound: 0,
        start: 0,
        docs: [],
    });
    const [page, setPage] = useState<number>(1);

    useEffect(() => {
        async function loadData() {
            let data = [];
            const url = getObjectChildrenUrl(pid, (page - 1) * pageSize, pageSize);
            try {
                data = await fetchJSON(url);
            } catch (e) {
                console.error("Problem fetching tree data from " + url);
            }
            setChildren(data);
        }
        loadData();
    }, [page]);
    const childDocs = children?.docs ?? [];
    const contents = childDocs.length > 0
        ? (childDocs).map((child) => {
            return (
                <li key={(pid || "root") + "child" + child.id}>
                    <Child pid={child.id} initialTitle={child.title ?? "-"} />
                </li>
            );
        }) : <p>Empty.</p>;
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
