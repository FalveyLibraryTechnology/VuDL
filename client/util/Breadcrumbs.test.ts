import { generateBreadcrumbTrails, processBreadcrumbData } from "./Breadcrumbs";

describe("generateBreadcrumbTrails", () => {
    it("handles empty data gracefully", () => {
        expect(generateBreadcrumbTrails({}, "foo")).toEqual([[]]);
    });

    it("handles missing record data gracefully", () => {
        const treeData = {
            topNodes: [ 'folder1', 'folder2' ],
            records: {},
            childLookups: {
                folder1: new Set([ 'runway' ]),
                folder2: new Set([ 'runway' ]),
                runway: new Set([ 'child' ]),
            }
        };
        expect(generateBreadcrumbTrails(treeData, "child")).toEqual(
            [
                [
                    {"parents": [], "pid": "folder1", "title": "-"},
                    {"parents": [], "pid": "runway", "title": "-"},
                ],
                [
                    {"parents": [], "pid": "folder2", "title": "-"},
                    {"parents": [], "pid": "runway", "title": "-"},
                ],
            ]
        );
    });

    it("can handle a child with multiple roots", () => {
        const treeData = {
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
            }
        };
        expect(generateBreadcrumbTrails(treeData, "child")).toEqual(
            [
                [
                    {"parents": [], "pid": "folder1", "title": "folder1"},
                    {"parents": [], "pid": "runway", "title": "runway"},
                ],
                [
                    {"parents": [], "pid": "folder2", "title": "folder2"},
                    {"parents": [], "pid": "runway", "title": "runway"},
                ],
            ]
        );
    });

    it("can handle a child with multiple parents and a shared root with runway", () => {
        const treeData = {
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
            }
        };
        expect(generateBreadcrumbTrails(treeData, "child")).toEqual(
            [
                [
                    {"parents": [], "pid": "root", "title": "root"},
                    {"parents": [], "pid": "runway", "title": "runway"},
                    {"parents": [], "pid": "folder1", "title": "folder1"}
                ],
                [
                    {"parents": [], "pid": "root", "title": "root"},
                    {"parents": [], "pid": "runway", "title": "runway"},
                    {"parents": [], "pid": "folder2", "title": "folder2"}
                ],
            ]
        );
    });
});

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
                }
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
                }
            }
        );
    });
});