import { extractFirstMetadataValue } from "./metadata";

describe("extractFirstMetadataValue", () => {
    it("should return a default when no value is defined", () => {
        expect(extractFirstMetadataValue({}, "foo", "default")).toEqual("default");
    });
    it("should return the first value when it is defined", () => {
        expect(extractFirstMetadataValue({foo: ["bar1", "bar2"]}, "foo", "default")).toEqual("bar1");
    });
})