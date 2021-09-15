import { getSessionStorage } from "./sessionStorage";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("sessionStorage", () => {
    beforeEach(() => {
        Object.defineProperty(window, "sessionStorage", {
            value: {
                getItem: jest.fn(() => null),
            },
            writable: true,
        });
    });

    describe("getSessionStorage", () => {
        it("should return initial storage value if item doesn't exist", () => {
            window.sessionStorage.getItem.mockReturnValue(null);
            expect(getSessionStorage("test1", "test2")).toEqual("test2");
        });

        it("should return existing value", () => {
            window.sessionStorage.getItem.mockReturnValue("true");
            expect(getSessionStorage("test1", "test2")).toEqual(true);
        });
    });
});
