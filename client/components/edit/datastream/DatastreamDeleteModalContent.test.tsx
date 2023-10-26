import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderer from "react-test-renderer";
import DatastreamDeleteModalContent from "./DatastreamDeleteModalContent";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => mockUseDatastreamOperation());
describe("DatastreamDeleteModalContent", () => {
    let editorValues;
    let datastreamOperationValues;
    beforeEach(() => {
        editorValues = {
            state: {
                currentPid: "vudl:123",
                activeDatastream: "THUMBNAIL",
            },
            action: {
                loadCurrentObjectDetails: jest.fn().mockResolvedValue({}),
                setSnackbarState: jest.fn(),
                toggleDatastreamModal: jest.fn(),
            },
        };
        datastreamOperationValues = {
            deleteDatastream: jest.fn(),
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
    });

    it("renders", () => {
        const tree = renderer.create(<DatastreamDeleteModalContent />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("calls deleteDatastream", async () => {
        render(<DatastreamDeleteModalContent />);
        await userEvent.setup().click(screen.getByText("Yes"));
        expect(datastreamOperationValues.deleteDatastream).toHaveBeenCalled();
    });
});
