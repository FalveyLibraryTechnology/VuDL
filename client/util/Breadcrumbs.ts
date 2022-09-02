export interface TreeNode {
    pid: string;
    title: string;
    parents: Array<TreeNode>;
}

export interface TreeData {
    topNodes: Array<string>;
    records: Record<string, TreeNode>;
    childLookups: Record<string, Set<string>>;
    paths: Array<Array<TreeNode>>;
}

interface QueueTreeNode {
    current: TreeNode;
    path: Array<TreeNode>;
}

/**
 * Analyze the raw breadcrumb data, identifying top-level nodes (i.e. nodes with
 * no parents) and creating lookup tables for children. This makes it easier to
 * render breadcrumbs from left to right and to find all relevant trails.
 */
export function processBreadcrumbData(data: TreeNode): TreeData {
    const queue: Array<QueueTreeNode> = [{ current: data, path: [] }];
    const topNodes: Set<string> = new Set(); // use set to avoid duplicates
    const childLookups: Record<string, Set<string>> = {};
    const records: Record<string, TreeNode> = {};
    const paths: Array<Array<TreeNode>> = [];
    while (queue.length > 0) {
        const { current, path } = queue.shift() as QueueTreeNode;
        if (current.parents.length === 0) {
            paths.push(path);
            topNodes.add(current.pid);
        }
        records[current.pid] = { pid: current.pid, title: current.title, parents: [] };
        current.parents.forEach((parent) => {
            queue.push({ current: parent, path: [parent, ...path] });
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
        paths,
    };
}
