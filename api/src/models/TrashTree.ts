import TrashTreeNode from "./TrashTreeNode";

class TrashTree {
    protected _rootPid;
    protected _orphanedNodes: Array<TrashTreeNode> = [];
    protected rootNodes: Array<TrashTreeNode> = [];
    protected nodeIndex: Record<string, TrashTreeNode> = {};

    constructor(rootPid: string) {
        this._rootPid = rootPid;
    }

    addParentsToNode(node: TrashTreeNode, parentList: Array<string>): void {
        for (const parentPid of parentList) {
            const parentNode = this.nodeIndex[parentPid] ?? null;
            if (parentNode !== null) {
                node.addParentNode(parentNode);
                parentNode.addChild(node);
            }
        }
    }

    addNode(node: TrashTreeNode): void {
        this.nodeIndex[node.pid] = node;
        if (node.parentPids.includes(this._rootPid)) {
            this.rootNodes.push(node);
        }
        this.addParentsToNode(node, node.parentPids);
        for (const parent in node.parentPids) {
            if ((this.nodeIndex[parent] ?? null) !== null) {
                this.nodeIndex[parent].addChild(node);
            }
        }
        if (node.missingParentNodePids.filter((x) => x !== this._rootPid).length > 0) {
            this._orphanedNodes.push(node);
        }
    }

    removeLeafNode(node: TrashTreeNode): void {
        const indexedNode = this.nodeIndex[node.pid] ?? null;
        if (indexedNode === null) {
            throw new Error("Unrecognized node provided.");
        }
        if (indexedNode.childNodes.length > 0) {
            throw new Error(`${node.pid} is not a leaf node!`);
        }
        for (const parent of indexedNode.parentNodes) {
            parent.removeChildByPid(node.pid);
        }
        this._orphanedNodes = this._orphanedNodes.filter((x) => x.pid !== node.pid);
        this.rootNodes = this.rootNodes.filter((x) => x.pid !== node.pid);
        delete this.nodeIndex[node.pid];
    }

    getNextLeaf(): TrashTreeNode | null {
        for (const node of this.rootNodes) {
            return node.firstLeaf;
        }
        return null;
    }

    reuniteOrphans(): void {
        this._orphanedNodes = this._orphanedNodes.filter((node) => {
            const missingNodes = node.missingParentNodePids.filter((x) => x !== this._rootPid);
            if (missingNodes.length > 0) {
                this.addParentsToNode(node, missingNodes);
                return node.missingParentNodePids.filter((x) => x !== this._rootPid).length > 0;
            }
            return false;
        });
    }

    get orphanedNodes(): Array<TrashTreeNode> {
        this.reuniteOrphans();
        return this._orphanedNodes;
    }

    get rootPid(): string {
        return this._rootPid;
    }
}

export default TrashTree;
