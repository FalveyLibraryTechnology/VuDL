import { processBreadcrumbData } from "./Breadcrumbs";

describe("processBreadcrumbData", () => {
    it("can handle a child with multiple parents and a shared root", () => {
        const root = { pid: "root", title: "root", parents: [] };
        const folder1 = { pid: "folder1", title: "folder1", parents: [root] };
        const folder2 = { pid: "folder2", title: "folder2", parents: [root] };
        const child = { pid: "child", title: "child", parents: [folder1, folder2] };
        const result = processBreadcrumbData(child);
        expect(result).toEqual(
            {
                topNodes: [ 'root' ],
                records: {
                  child: { pid: 'child', title: 'child', parents: [] },
                  folder1: { pid: 'folder1', title: 'folder1', parents: [] },
                  folder2: { pid: 'folder2', title: 'folder2', parents: [] },
                  root: { pid: 'root', title: 'root', parents: [] }
                },
                childLookups: {
                  folder1: [ 'child' ],
                  folder2: [ 'child' ],
                  root: [ 'folder1', 'folder2' ]
                }
            }
        );
    });
});