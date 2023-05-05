import TrashTree from "./TrashTree";
import TrashTreeNode from "./TrashTreeNode";

describe("TrashTree", () => {
    it("can return its own root PID", () => {
        const tree = new TrashTree("trashcan");
        expect(tree.rootPid).toEqual("trashcan");
    });

    it("can attach nodes to the tree and remove them", () => {
        const tree = new TrashTree("trashcan");
        const parent = new TrashTreeNode("parent", ["trashcan"]);
        const child = new TrashTreeNode("child", ["parent"]);

        // attach child node out of order -- we'll have an orphan!
        tree.addNode(child);
        expect(tree.orphanedNodes).toEqual([child]);

        // now attach parent -- this should sort everything out!
        tree.addNode(parent);
        expect(tree.orphanedNodes).toEqual([]);
        expect(tree.getNextLeaf().pid).toEqual("child");

        // now detach child -- the parent should be our next leaf.
        tree.removeLeafNode(child);
        expect(tree.getNextLeaf().pid).toEqual("parent");

        // now detach parent -- the tree should be empty again.
        tree.removeLeafNode(parent);
        expect(tree.getNextLeaf()).toEqual(null);
    });
});
