export interface TreeNode {
    pid: string;
    title: string;
    parents: Array<TreeNode>;
}

export interface TreeData {
    topNodes: Array<string>;
    records: Record<string, TreeNode>;
    childLookups: Record<string, Set<string>>;
}

interface BreadcrumbTrail {
    pid: string;
    path: Array<TreeNode>;
}

/**
 * Analyze the raw breadcrumb data, identifying top-level nodes (i.e. nodes with
 * no parents) and creating lookup tables for children. This makes it easier to
 * render breadcrumbs from left to right and to find all relevant trails.
 */
export function processBreadcrumbData(data: TreeNode): TreeData {
    const queue: Array<TreeNode> = [data];
    const topNodes: Set<string> = new Set(); // use set to avoid duplicates
    const childLookups: Record<string, Set<string>> = {};
    const records: Record<string, TreeNode> = {};
    while (queue.length > 0) {
        const current = queue.shift();
        if (current.parents.length === 0) {
            topNodes.add(current.pid);
        }
        records[current.pid] = { pid: current.pid, title: current.title, parents: [] };
        current.parents.forEach((parent) => {
            queue.push(parent);
            if (typeof childLookups[parent.pid] === "undefined") {
                childLookups[parent.pid] = new Set([current.pid]);
            } else {
                childLookups[parent.pid].add(current.pid);
            }
        });
    }
    return {
        topNodes: Array.from(topNodes),
        records,
        childLookups,
    };
}

export function generateBreadcrumbTrails(treeData: TreeData, pid: string) {
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

