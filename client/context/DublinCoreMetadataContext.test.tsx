import { describe, expect, it } from "@jest/globals";
import { renderHook, act } from "@testing-library/react-hooks";
import { DublinCoreMetadataContextProvider, useDublinCoreMetadataContext } from "./DublinCoreMetadataContext";

describe("useDublinCoreMetadataContext", () => {
    describe("setCurrentDublinCore", () => {
        it("sets the current Dublin Core", async () => {
            const dc = { "dc:title": ["foo"] };
            const { result } = await renderHook(() => useDublinCoreMetadataContext(), { wrapper: DublinCoreMetadataContextProvider });

            expect(result.current.state.currentDublinCore).toEqual({});

            await act(async () => {
                await result.current.action.setCurrentDublinCore(dc);
            });

            expect(result.current.state.currentDublinCore).toEqual(dc);
        });
    });
});
