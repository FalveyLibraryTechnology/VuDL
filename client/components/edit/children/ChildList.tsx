import styles from "./ChildList.module.css";
import React, { useEffect, useState } from "react";
import { useEditorContext } from "../../../context/EditorContext";
import Child from "./Child";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";

export interface ChildListProps {
    pid?: string;
    pageSize?: number;
}

export const ChildList = ({ pid = "", pageSize = 10 }: ChildListProps): React.ReactElement => {
    const {
        state: { childListStorage },
        action: { getChildListStorageKey, loadChildrenIntoStorage },
    } = useEditorContext();
    const [page, setPage] = useState<number>(1);
    const key = getChildListStorageKey(pid, page, pageSize);
    const loaded = Object.prototype.hasOwnProperty.call(childListStorage, key);
    useEffect(() => {
        if (!loaded) {
            loadChildrenIntoStorage(pid, page, pageSize);
        }
    }, [loaded]);
    if (!loaded) {
        return (
            <p>
                <CircularProgress size="1em" /> Loading...
            </p>
        );
    }
    const children = childListStorage[key];
    const childDocs = children.docs;
    const contents =
        childDocs.length > 0 ? (
            childDocs.map((child: Record<string, string>) => {
                return (
                    <li key={`${pid}_child_${child.id}`}>
                        <Child pid={child.id} parentPid={pid} initialTitle={child.title ?? "-"} />
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
            <ul className={styles.childlist}>{contents}</ul>
        </>
    );
};

export default ChildList;
