import styles from "./Breadcrumbs.module.css";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useFetchContext } from "../../context/FetchContext";
import { apiUrl } from "../../util/routes";
import Link from "next/link";

interface TreeNode {
    pid: string;
    title: string;
    parents: Array<TreeNode>;
}

interface TreeData {
    topNodes: Array<string>;
    records: Record<string, TreeNode>;
    childLookups: Record<string, Array<string>>;
}

interface BreadcrumbTrail {
    pid: string;
    path: Array<TreeNode>;
}

const Breadcrumbs = ({ pid = null }) => {
    const {
        action: { fetchJSON },
    } = useFetchContext();
    const [treeData, setTreeData] = useState([]);

    /**
     * Analyze the raw breadcrumb data, identifying top-level nodes (i.e. nodes with
     * no parents) and creating lookup tables for children. This makes it easier to
     * render breadcrumbs from left to right and to find all relevant trails.
     */
    function processBreadcrumbData(data: TreeNode): TreeData {
        const queue: Array<TreeNode> = [data];
        const topNodes: Array<string> = [];
        const childLookups: Record<string, Array<string>> = {};
        const records: Record<string, TreeNode> = {};
        while (queue.length > 0) {
            const current = queue.shift();
            if (!current) {
                break;
            }
            if (current.parents.length === 0) {
                topNodes.push(current.pid);
            }
            records[current.pid] = { pid: current.pid, title: current.title, parents: [] };
            current.parents.forEach((parent) => {
                queue.push(parent);
                if (typeof childLookups[parent.pid] === "undefined") {
                    childLookups[parent.pid] = [current.pid];
                } else {
                    childLookups[parent.pid].push(current.pid);
                }
            });
        }
        return {
            topNodes: [...new Set(topNodes)], // deduplicate
            records,
            childLookups,
        };
    }

    useEffect(() => {
        async function loadData() {
            let data: TreeData = {
                topNodes: [],
                childLookups: {},
                records: {},
            };
            const url = apiUrl + "/edit/object/parents/" + encodeURIComponent(pid);
            try {
                data = processBreadcrumbData(await fetchJSON(url));
            } catch (e) {
                console.error("Problem fetching breadcrumb data from " + url);
            }
            setTreeData(data);
        }
        loadData();
    }, []);

    function generateBreadcrumbTrails(treeData: TreeData, pid: string) {
        // BFS from top (root id) to target pid
        const queue: Array<BreadcrumbTrail> = (treeData.topNodes ?? []).map((rootId) => {
            return {
                pid: rootId,
                path: [],
            };
        });
        const result: Array<Array<TreeNode>> = [];
        while (queue.length > 0) {
            const current = queue.shift();
            if (!current) {
                break;
            }
            const record = treeData.records[current.pid] ?? {};
            const path = current.path;
            path.push(record);
            (treeData.childLookups[current.pid] ?? []).forEach((childPid: string) => {
                // At target
                if (childPid === pid) {
                    result.push(path);
                } else {
                    // Add to queue for more
                    queue.push({
                        pid: childPid,
                        path: [...path], // clone array to avoid multiple references to the same array
                    });
                }
            });
        }
        // Even if no trails were found, at least return a single empty array so that we can
        // display the "Edit Home" link when we process the data.
        return result.length == 0 ? [[]] : result;
    }

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

Breadcrumbs.propTypes = {
    pid: PropTypes.string,
};

export default Breadcrumbs;
