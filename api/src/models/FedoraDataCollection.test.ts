import FedoraDataCollection from "./FedoraDataCollection";

let fedoraData;
beforeEach(() => {
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
});
