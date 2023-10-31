import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DatastreamModal from "./DatastreamModal";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("./DatastreamUploadModalContent", () => () => "DatastreamUploadModalContent");
jest.mock("./DatastreamDeleteModalContent", () => () => "DatastreamDeleteModalContent");

describe("DatastreamModal", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            state: {
                datastreamModalState: "",
                isDatastreamModalOpen: true,
            },
            action: {
                toggleDatastreamModal: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("toggles the datastreamModal", async () => {
        render(<DatastreamModal />);
        await userEvent.setup().click(screen.getByRole("button"));
        expect(editorValues.action.toggleDatastreamModal).toHaveBeenCalled();
    });

    it("switches to the delete modal content", () => {
        editorValues.state.datastreamModalState = "Delete";

        render(<DatastreamModal />);
        expect(screen.queryAllByText("DatastreamDeleteModalContent")).toHaveLength(1);
    });

    it("switches to the upload modal content", () => {
        editorValues.state.datastreamModalState = "Upload";

        render(<DatastreamModal />);
        expect(screen.queryAllByText("DatastreamUploadModalContent")).toHaveLength(1);
    });
});
