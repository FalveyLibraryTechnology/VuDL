import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderHook, act } from "@testing-library/react-hooks";
import { GlobalContextProvider, useGlobalContext } from "./GlobalContext";

describe("useGlobalContext", () => {
    describe("setSnackbarState", () => {
        it("sets the snackbar state with text and severity", async () => {
            const { result } = await renderHook(() => useGlobalContext(), { wrapper: GlobalContextProvider });

            expect(result.current.state.snackbarState).toEqual({
                open: false,
                message: "",
                severity: "info"
            });

            await act(async () => {
                await result.current.action.setSnackbarState({
                    open: true,
                    message: "oh no!",
                    severity: "error"
                });
            });

            expect(result.current.state.snackbarState).toEqual({
                open: true,
                message: "oh no!",
                severity: "error"
            });
        });
    });
});
