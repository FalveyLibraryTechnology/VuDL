import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderHook, act } from "@testing-library/react-hooks";
import { EditorContextProvider, useEditorContext } from "./EditorContext";

const mockUseFetchContext = jest.fn();
jest.mock("./FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));

describe("useEditorContext", () => {
    let fetchValues;
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

    describe("setCurrentPid", () => {
        it("sets the current pid", async () => {
            const { result } = await renderHook(() => useEditorContext(), { wrapper: EditorContextProvider });

            expect(result.current.state.currentPid).toBeNull();

            await act(async () => {
                await result.current.action.setCurrentPid("test1");
            });

            expect(result.current.state.currentPid).toEqual("test1");
        });
    });

    describe("toggleDatastreamModal", () => {
        it("toggles the modal", async () => {
            const { result } = await renderHook(() => useEditorContext(), { wrapper: EditorContextProvider });

            expect(result.current.state.isDatastreamModalOpen).toBeFalsy();

            await act(async () => {
                await result.current.action.toggleDatastreamModal();
            });

            expect(result.current.state.isDatastreamModalOpen).toBeTruthy();
        });
    });

    describe("setDatastreamModalState", () => {
        it("sets the modal state", async () => {
            const { result } = await renderHook(() => useEditorContext(), { wrapper: EditorContextProvider });

            expect(result.current.state.datastreamModalState).toBeNull();

            await act(async () => {
                await result.current.action.setDatastreamModalState("test1");
            });

            expect(result.current.state.datastreamModalState).toEqual("test1");
        });
    });

    describe("setActiveDatastream", () => {
        it("sets the active datastream", async () => {
            const { result } = await renderHook(() => useEditorContext(), { wrapper: EditorContextProvider });

            expect(result.current.state.activeDatastream).toBeNull();

            await act(async () => {
                await result.current.action.setActiveDatastream("test1");
            });

            expect(result.current.state.activeDatastream).toEqual("test1");
        });
    });

    describe("initializeCatalog", () => {
        it("initializes the models catalog", async () => {
            fetchValues.action.fetchJSON.mockResolvedValue({
                models: {
                    CoreModel: "test1"
                },

            });
            const { result } = await renderHook(() => useEditorContext(), { wrapper: EditorContextProvider });

            await act(async () => {
                await result.current.action.initializeCatalog();
            });

            expect(fetchValues.action.fetchJSON).toHaveBeenCalled();
        });

        it("throws an error", async () => {
            const errorSpy = jest.spyOn(global.console, "error").mockImplementation(jest.fn());
            fetchValues.action.fetchJSON.mockRejectedValue("test1");
            const { result } = await renderHook(() => useEditorContext(), { wrapper: EditorContextProvider });

            await act(async () => {
                await result.current.action.initializeCatalog();
            });

            expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Problem fetching object catalog"));
        });
    });

    describe("loadCurrentObjectDetails", () => {
        it("calls the current object details request", async () => {
            const { result } = await renderHook(() => useEditorContext(), { wrapper: EditorContextProvider });

            expect(result.current.state.modelsDatastreams.length).toBe(0);

            act(() => {
                result.current.action.setCurrentPid("test1");
            });

            fetchValues.action.fetchJSON.mockResolvedValueOnce({
                models: {
                    CoreModel: {
                        datastreams: {
                            THUMBNAIL: {
                                allowedType: "image",
                                allowedSubtypes: "jpeg,gif,png"
                            }
                        }
                    }
                }
            });

            await act(async () => {
                await result.current.action.initializeCatalog();
            });

            fetchValues.action.fetchJSON.mockResolvedValueOnce({
                models: [
                    "vudl-system:CoreModel"
                ]
            });

            await act(async () => {
                await result.current.action.loadCurrentObjectDetails();
            });

            expect(fetchValues.action.fetchJSON).toHaveBeenCalled();
            expect(result.current.state.modelsDatastreams.length).toBe(1);
        });

        it("throws an error", async () => {
            const errorSpy = jest.spyOn(global.console, "error").mockImplementation(jest.fn());
            fetchValues.action.fetchJSON.mockRejectedValue("test1");
            const { result } = await renderHook(() => useEditorContext(), { wrapper: EditorContextProvider });

            act(() => {
                result.current.action.setCurrentPid("test1");
            });

            await act(async () => {
                await result.current.action.loadCurrentObjectDetails();
            });

            expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Problem fetching object details"));
        });
    });

    describe("setSnackbarState", () => {
        it("sets the snackbar state with text and severity", async () => {
            const { result } = await renderHook(() => useEditorContext(), { wrapper: EditorContextProvider });

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

    describe("extractFirstMetadataValue", () => {
        it("returns a default value if no matching field is found", async () => {
            const { result } = await renderHook(() => useEditorContext(), { wrapper: EditorContextProvider });
            expect(result.current.action.extractFirstMetadataValue("field", "default")).toEqual("default");
        });

        it("extracts the first value when a matching field is found", async () => {
            fetchValues.action.fetchJSON.mockResolvedValue({
                metadata: {
                    field: ["foo", "bar"],
                },
            });
            const { result } = await renderHook(() => useEditorContext(), { wrapper: EditorContextProvider });
            await act(async () => {
                await result.current.action.setCurrentPid("test:123");
                await result.current.action.loadCurrentObjectDetails();
            });
            expect(result.current.action.extractFirstMetadataValue("field", "default")).toEqual("foo");
        });
    });
});
