import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import DatastreamUploadModalContent from "./DatastreamUploadModalContent";

const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => mockUseDatastreamOperation());
const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("./DatastreamAgentsContent", () => () => {
    return "DatastreamAgentsContent";
});
jest.mock("./DatastreamLicenseContent", () => () => {
    return "DatastreamLicenseContent";
});

describe("DatastreamUploadModalContent", () => {
    let datastreamOperationValues;
    let editorValues;
    beforeEach(() => {
        editorValues = {
            state: {
                activeDatastream: "test1",
            },
        };
        datastreamOperationValues = {
            uploadFile: jest.fn(),
        };
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("renders", () => {
        const { asFragment } = render(<DatastreamUploadModalContent />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders DatastreamLicenseContent", () => {
        editorValues.state.activeDatastream = "LICENSE";

        const { container } = render(<DatastreamUploadModalContent />);
        expect(container.innerHTML).toEqual("DatastreamLicenseContent");
    });

    it("renders DatastreamAgentContent", () => {
        editorValues.state.activeDatastream = "AGENTS";

        const { container } = render(<DatastreamUploadModalContent />);
        expect(container.innerHTML).toEqual("DatastreamAgentsContent");
    });

    it("calls uploadFile on click", async () => {
        datastreamOperationValues.uploadFile.mockResolvedValue("upload worked");
        render(<DatastreamUploadModalContent />);

        await act(async () => {
            fireEvent.change(screen.getByLabelText("Upload File"), {
                target: {
                    files: [
                        {
                            type: "image/png",
                        },
                    ],
                },
            });
        });
        expect(datastreamOperationValues.uploadFile).toHaveBeenCalled();
    });
});
