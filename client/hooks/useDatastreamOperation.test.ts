import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { UploadFile } from "@mui/icons-material";
import { renderHook, act } from "@testing-library/react-hooks";
import { deleteObjectDatastreamUrl, downloadObjectDatastreamUrl, postObjectDatastreamUrl } from "../util/routes";
import useDatastreamOperation from "./useDatastreamOperation";

const mockUseFetchContext = jest.fn();
jest.mock("../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));
const mockUseEditorContext = jest.fn();
jest.mock("../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

describe("useDatastreamOperation", () => {
    let fetchValues;
    let editorValues;
    let currentPid;
    let activeDatastream;
    let datastreamsCatalog;
    beforeEach(() => {
        currentPid =  "vudl:123";
        activeDatastream = "THUMBNAIL";
        datastreamsCatalog = {
            THUMBNAIL: {
                mimetype: {
                    allowedType: "image",
                    allowedSubtypes: "png",
                },
            },
        };
        fetchValues = {
            action: {
                fetchBlob: jest.fn(),
                fetchText: jest.fn()
            }
        };
        editorValues = {
            state: {
                currentPid,
                activeDatastream,
                datastreamsCatalog
            },
            action: {
                setSnackbarState: jest.fn(),
                toggleDatastreamModal: jest.fn(),
                getCurrentModelsDatastreams: jest.fn()
            },
        };
        mockUseFetchContext.mockReturnValue(fetchValues);
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    describe("uploadFile", () => {
        it("uploads success", async () => {
            fetchValues.action.fetchText.mockResolvedValue("upload worked");

            const { uploadFile } = useDatastreamOperation();
            await uploadFile({
                type: "image/png",
            });


            expect(fetchValues.action.fetchText).toHaveBeenCalledWith(
                expect.stringContaining(editorValues.state.currentPid),
                expect.objectContaining({
                    method: "POST",
                    body: expect.any(FormData),
                })
            );
            expect(editorValues.action.getCurrentModelsDatastreams).toHaveBeenCalled();
            expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith({
                open: true,
                message: "upload worked",
                severity: "success",
            });
        });

        it("returns illegal mime type when type is invalid", async () => {
            const { uploadFile } = useDatastreamOperation();
            await uploadFile({
                type: "image/illegaltype",
            });
            expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith({
                open: true,
                message: expect.stringContaining("Illegal mime type"),
                severity: "error",
            });
            expect(editorValues.action.toggleDatastreamModal).toHaveBeenCalled();
        });

        it("returns illegal mime type when catalog cannot find datastream", async () => {
            editorValues.state.datastreamsCatalog = {};
            const { uploadFile } = useDatastreamOperation();

            await uploadFile({
                type: "image/png",
            });

            expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith({
                open: true,
                message: expect.stringContaining("Illegal mime type"),
                severity: "error",
            });
            expect(editorValues.action.toggleDatastreamModal).toHaveBeenCalled();
        });
    });

    describe("deleteDatastream", () => {
        it("deletes with success", async () => {
            fetchValues.action.fetchText.mockResolvedValue("Delete success!");

            const { deleteDatastream } = useDatastreamOperation();
            await deleteDatastream()

            expect(fetchValues.action.fetchText).toHaveBeenCalledWith(
                expect.stringContaining(editorValues.state.currentPid),
                expect.objectContaining({
                    method: "DELETE",
                })
            );
            expect(editorValues.action.getCurrentModelsDatastreams).toHaveBeenCalled();
            expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith(
                expect.objectContaining({
                    open: true,
                    message: "Delete success!",
                    severity: "success",
                })
            );
        });

        it("deletes with failure ", async () => {
            fetchValues.action.fetchText.mockRejectedValue(new Error("Delete failure!"));

            const { deleteDatastream } = useDatastreamOperation();
            await deleteDatastream()

            expect(fetchValues.action.fetchText).toHaveBeenCalledWith(
                expect.stringContaining(editorValues.state.currentPid),
                expect.objectContaining({
                    method: "DELETE",
                })
            );

            expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith(
                expect.objectContaining({
                    open: true,
                    message: "Delete failure!",
                    severity: "error",
                })
            );
        });
    });

    describe("downloadDatastream", () => {
        let blob;
        let headers;
        let createObjectURL;
        let createElement;
        let link;
        let body;
        beforeEach(() => {
            blob = new Blob(["test"], {type: 'text/pdf'});
            headers = new Headers();
            createObjectURL = jest.fn().mockReturnValue("test3");
            link = {
                href: null,
                setAttribute: jest.fn(),
                click: jest.fn()
            };
            createElement = jest.fn().mockReturnValue(link);
            body = {
                appendChild: jest.fn()
            };
            Object.defineProperty(global, "document", {
                value: {
                    body,
                    createElement
                },
                writable: true,
            });
            Object.defineProperty(global, "URL", {
                value: {
                    createObjectURL
                },
                writable: true,
            });
        });

        it("success", async () => {
            headers.append("Content-Type", "image/jpeg");
            headers.append("Content-Disposition", "attachment; filename=test.jpeg");
            fetchValues.action.fetchBlob.mockResolvedValue({
                headers,
                blob
            });
            const { downloadDatastream } = useDatastreamOperation();
            await downloadDatastream("test1");

            expect(createElement).toHaveBeenCalledWith("a");
            expect(createObjectURL).toHaveBeenCalledWith(blob);
            expect(link.setAttribute).toHaveBeenCalledWith("download", "test.jpeg");
            expect(body.appendChild).toHaveBeenCalledWith(link);
            expect(link.click).toHaveBeenCalled();
        });

        it("throws incorrect file type for non-existing mimetype", async () => {
            headers.append("Content-Type", "image/jpeg");
            blob = null;
            fetchValues.action.fetchBlob.mockResolvedValue({
                headers,
                blob
            });
            const { downloadDatastream } = useDatastreamOperation();
            await downloadDatastream("test1");

            expect(fetchValues.action.fetchBlob).toHaveBeenCalledWith(
                expect.stringContaining(editorValues.state.currentPid)
            );

            expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith(
                expect.objectContaining({
                    open: true,
                    message: "Incorrect file format",
                    severity: "error",
                })
            );
        });

        it("throws incorrect file type for undefined blob", async () => {
            fetchValues.action.fetchBlob.mockResolvedValue({
                headers,
                blob
            });
            const { downloadDatastream } = useDatastreamOperation();
            await downloadDatastream("test1");

            expect(fetchValues.action.fetchBlob).toHaveBeenCalledWith(
                expect.stringContaining(editorValues.state.currentPid)
            );

            expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith(
                expect.objectContaining({
                    open: true,
                    message: "Incorrect file format",
                    severity: "error",
                })
            );
        });

        it("error", async () => {
            fetchValues.action.fetchBlob.mockRejectedValue(new Error("Download failure!"));

            const { downloadDatastream } = useDatastreamOperation();
            await downloadDatastream("test1");

            expect(fetchValues.action.fetchBlob).toHaveBeenCalledWith(
                expect.stringContaining(editorValues.state.currentPid)
            );

            expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith(
                expect.objectContaining({
                    open: true,
                    message: "Download failure!",
                    severity: "error",
                })
            );
        });
    });

});
