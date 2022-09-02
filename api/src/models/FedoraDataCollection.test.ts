import Config from "./Config";
import FedoraDataCollection from "./FedoraDataCollection";

let fedoraData;
beforeEach(() => {
    Config.setInstance(new Config({}));
    fedoraData = FedoraDataCollection.build("foo:123");
});

describe("FedoraDataCollection", () => {
    describe("addParent", () => {
        it("adds a parent", () => {
            expect(fedoraData.parents).toEqual([]);
            const parent = FedoraDataCollection.build("parent:123");
            fedoraData.addParent(parent);
            expect(fedoraData.parents).toEqual([parent]);
        });
    });

    describe("getParentTree", () => {
        it("returns an appropriate parent tree", () => {
            expect(fedoraData.getParentTree()).toEqual({ pid: "foo:123", title: "", parents: [] });
            const parent = FedoraDataCollection.build("parent:123");
            fedoraData.addParent(parent);
            expect(fedoraData.getParentTree()).toEqual({
                pid: "foo:123",
                title: "",
                parents: [{ pid: "parent:123", title: "", parents: [] }],
            });
        });
    });

    describe("getAllHierarchyTops", () => {
        it("returns the current object when it has no parents", () => {
            expect(fedoraData.getAllHierarchyTops()).toEqual([fedoraData]);
        });

        it("recurses to the top of the tree when an object has parents", () => {
            const parent = FedoraDataCollection.build("parent:123");
            fedoraData.addParent(parent);
            expect(fedoraData.getAllHierarchyTops()).toEqual([parent]);
        });

        it("recurses to the top of the tree when an object has grandparents", () => {
            const grandparent = FedoraDataCollection.build("grandparent:123");
            const parent = FedoraDataCollection.build("parent:123");
            parent.addParent(grandparent);
            fedoraData.addParent(parent);
            expect(fedoraData.getAllHierarchyTops()).toEqual([grandparent]);
        });

        it("cuts tree traversal short when it encounters a top-level pid", () => {
            Config.setInstance(new Config({ top_level_pids: ["grandparent:123"] }));
            const grandparent = FedoraDataCollection.build("grandparent:123");
            const parent = FedoraDataCollection.build("parent:123");
            parent.addParent(grandparent);
            fedoraData.addParent(parent);
            expect(fedoraData.getAllHierarchyTops()).toEqual([parent]);
        });
    });

    describe("models", () => {
        it("strips model prefixes correctly", () => {
            fedoraData.fedoraDetails = {
                hasModel: [
                    "http://localhost:8080/rest/vudl-system:PDFData",
                    "http://localhost:8080/rest/vudl-system:CoreModel",
                    "http://localhost:8080/rest/vudl-system:DataModel",
                ],
            };
            expect(fedoraData.models).toEqual([
                "vudl-system:PDFData",
                "vudl-system:CoreModel",
                "vudl-system:DataModel",
            ]);
        });
    });

    describe("sequences", () => {
        it("returns an empty array when sequence data is absent", () => {
            expect(fedoraData.sequences).toEqual([]);
        });

        it("returns sequence data when available", () => {
            const sequences = ["parent:123#1"];
            fedoraData.fedoraDetails = {
                sequence: sequences,
            };
            expect(fedoraData.sequences).toEqual(sequences);
        });
    });

    describe("state", () => {
        it("returns an unknown status when data is absent", () => {
            expect(fedoraData.state).toEqual("Unknown");
        });

        it("returns appropriate state data when present", () => {
            fedoraData.fedoraDetails = {
                state: ["Active"],
            };
            expect(fedoraData.state).toEqual("Active");
        });
    });
});
