import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderHook, act } from "@testing-library/react-hooks";
import { ChildListContextProvider, useChildListContext } from "./ChildListContext";

const mockUseFetchContext = jest.fn();
jest.mock("./FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));

describe("useChildListContext", () => {
    let fetchValues: Record<string, Record<string, () => unknown>>;
    beforeEach(() => {
        fetchValues =  {
            action: {
                fetchJSON: jest.fn()
            }
        };
        mockUseFetchContext.mockReturnValue(
            fetchValues
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("getChildListStorageKey", () => {
        it("generates appropriate keys", async () => {
            const { result } = await renderHook(() => useChildListContext(), { wrapper: ChildListContextProvider });
            expect(result.current.action.getChildListStorageKey("test:123", 1, 10)).toEqual("test:123_1_10");
        });
    });

    describe("loadChildDetailsIntoStorage", () => {
        it("successfully calls fetch", async () => {
            const { result } = await renderHook(() => useChildListContext(), { wrapper: ChildListContextProvider });
            expect(Object.keys(result.current.state.childDetailsStorage)).toEqual([]);
            await act(async () => {
                await result.current.action.loadChildDetailsIntoStorage("test:123");
            });
            expect(Object.keys(result.current.state.childDetailsStorage)).toEqual(["test:123"]);
            expect(fetchValues.action.fetchJSON).toHaveBeenCalledTimes(1);
            expect(fetchValues.action.fetchJSON).toHaveBeenCalledWith("http://localhost:9000/api/edit/object/test%3A123/details");
        });

        it("handles exceptions", async () => {
            const fetchSpy = jest.spyOn(fetchValues.action, "fetchJSON").mockImplementation(() => { throw new Error("kaboom"); });
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
            const { result } = await renderHook(() => useChildListContext(), { wrapper: ChildListContextProvider });
            await act(async () => {
                await result.current.action.loadChildDetailsIntoStorage("test:123");
            });
            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith("Problem fetching details from http://localhost:9000/api/edit/object/test%3A123/details");
        });
    });

    describe("loadChildrenIntoStorage", () => {
        it("successfully calls fetch", async () => {
            const { result } = await renderHook(() => useChildListContext(), { wrapper: ChildListContextProvider });
            expect(Object.keys(result.current.state.childListStorage)).toEqual([]);
            await act(async () => {
                await result.current.action.loadChildrenIntoStorage("test:123", 1, 10);
            });
            expect(Object.keys(result.current.state.childListStorage)).toEqual(["test:123_1_10"]);
            expect(fetchValues.action.fetchJSON).toHaveBeenCalledTimes(1);
            expect(fetchValues.action.fetchJSON).toHaveBeenCalledWith("http://localhost:9000/api/edit/object/test%3A123/children?start=0&rows=10");
        });

        it("handles exceptions", async () => {
            const fetchSpy = jest.spyOn(fetchValues.action, "fetchJSON").mockImplementation(() => { throw new Error("kaboom"); });
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
            const { result } = await renderHook(() => useChildListContext(), { wrapper: ChildListContextProvider });
            await act(async () => {
                await result.current.action.loadChildrenIntoStorage("test:123", 1, 10);
            });
            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith("Problem fetching tree data from http://localhost:9000/api/edit/object/test%3A123/children?start=0&rows=10");
        });
    });
});