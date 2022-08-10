import styles from "./Breadcrumbs.module.css";
import React, { useEffect, useState } from "react";
import { TreeData, generateBreadcrumbTrails, processBreadcrumbData } from "../../util/Breadcrumbs";
import { useFetchContext } from "../../context/FetchContext";
import { getObjectParentsUrl } from "../../util/routes";
import Link from "next/link";

interface BreadcrumbsProps {
    pid: string;
}

const Breadcrumbs = ({ pid = "" }: BreadcrumbsProps): React.ReactElement => {
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [treeData, setTreeData] = useState<TreeData>({
        topNodes: [],
        childLookups: {},
        records: {},
    });

    useEffect(() => {
        async function loadData() {
            let data: TreeData = {
                topNodes: [],
                childLookups: {},
                records: {},
            };
            const url = getObjectParentsUrl(pid);
            try {
                data = processBreadcrumbData(await fetchJSON(url));
            } catch (e) {
                console.error("Problem fetching breadcrumb data from " + url);
            }
            setTreeData(data);
        }
        loadData();
    }, []);

    const allTrails = generateBreadcrumbTrails(treeData, pid);
    const contents = allTrails.map((trail, trailIndex) => {
        const breadcrumbs = trail.map((breadcrumb) => {
            return (
                <li key={"breadcrumb_" + breadcrumb.pid + "_" + trailIndex}>
                    <Link href={"/edit/object/" + breadcrumb.pid}>{breadcrumb.title}</Link>
                </li>
            );
        });
        breadcrumbs.unshift(
            <li key={"breadcrumb_home_" + trailIndex}>
                <Link href="/edit">Edit Home</Link>
            </li>
        );
        return (
            <ul className={styles.breadcrumb} key={"breadcrumbs" + "_" + trailIndex}>
                {breadcrumbs}
            </ul>
        );
    });
    return <>{contents}</>;
};

export default Breadcrumbs;
