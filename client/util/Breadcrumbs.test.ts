import { processBreadcrumbData } from "./Breadcrumbs";

describe("processBreadcrumbData", () => {
    it("can handle a child with multiple roots", () => {
        const folder1 = { pid: "folder1", title: "folder1", parents: [] };
        const folder2 = { pid: "folder2", title: "folder2", parents: [] };
        const runway = { pid: "runway", title: "runway", parents: [folder1, folder2] };
        const child = { pid: "child", title: "child", parents: [runway] };
        const result = processBreadcrumbData(child);
        expect(result).toEqual(
            {
                topNodes: [ 'folder1', 'folder2' ],
                records: {
                  child: { pid: 'child', title: 'child', parents: [] },
                  folder1: { pid: 'folder1', title: 'folder1', parents: [] },
                  folder2: { pid: 'folder2', title: 'folder2', parents: [] },
                  runway: { pid: "runway", title: "runway", parents: [] },
                },
                childLookups: {
                  folder1: new Set([ 'runway' ]),
                  folder2: new Set([ 'runway' ]),
                  runway: new Set([ 'child' ]),
                },
                paths: [[folder1, runway], [folder2, runway]],
            }
        );
    });

    it("can handle a child with multiple parents and a shared root with runway", () => {
        const root = { pid: "root", title: "root", parents: [] };
        const runway = { pid: "runway", title: "runway", parents: [root] };
        const folder1 = { pid: "folder1", title: "folder1", parents: [runway] };
        const folder2 = { pid: "folder2", title: "folder2", parents: [runway] };
        const child = { pid: "child", title: "child", parents: [folder1, folder2] };
        const result = processBreadcrumbData(child);
        expect(result).toEqual(
            {
                topNodes: [ 'root' ],
                records: {
                  child: { pid: 'child', title: 'child', parents: [] },
                  folder1: { pid: 'folder1', title: 'folder1', parents: [] },
                  folder2: { pid: 'folder2', title: 'folder2', parents: [] },
                  root: { pid: 'root', title: 'root', parents: [] },
                  runway: { pid: "runway", title: "runway", parents: [] },
                },
                childLookups: {
                  folder1: new Set([ 'child' ]),
                  folder2: new Set([ 'child' ]),
                  root: new Set([ 'runway' ]),
                  runway: new Set([ 'folder1', 'folder2' ]),
                },
                paths: [[root, runway, folder1], [root, runway, folder2]],
            }
        );
    });
});
