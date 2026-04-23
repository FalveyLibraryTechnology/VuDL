import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import DatastreamDublinCoreFieldGroup from "./DatastreamDublinCoreFieldGroup";
import userEvent from "@testing-library/user-event";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

const mockUseDublinCoreMetadataContext = jest.fn();
jest.mock("../../../context/DublinCoreMetadataContext", () => ({
    useDublinCoreMetadataContext: () => {
        return mockUseDublinCoreMetadataContext();
    },
}));

jest.mock("@mui/material/Grid", () => (props) => props.children);
jest.mock("@mui/icons-material/AddCircle", () => (props) => props.titleAccess);
jest.mock("@mui/icons-material/Delete", () => (props) => props.titleAccess);

describe("DatastreamDublinCoreFieldGroup", () => {
    let dcValues;
    let editorValues;

    beforeEach(() => {
        editorValues = {
            state: {
                dublinCoreFieldCatalog: {
                    "dc:identifier": { type: "locked" },
                    "dc:title": { type: "text" },
                },
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        dcValues = {
            state: {
                currentDublinCore: {
                    "dc:identifier": ["foo"],
                    "dc:title": ["bar", "baz"],
                },
                keyCounter: {},
            },
            action: {
                addValueBelow: jest.fn(),
                deleteValue: jest.fn(),
                replaceValue: jest.fn(),
            },
        };
        mockUseDublinCoreMetadataContext.mockReturnValue(dcValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders unlocked fields", () => {
        const { asFragment } = render(<DatastreamDublinCoreFieldGroup field="dc:title" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders locked fields", () => {
        const { asFragment } = render(<DatastreamDublinCoreFieldGroup field="dc:identifier" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("inserts values below", async () => {
        render(<DatastreamDublinCoreFieldGroup field="dc:title" />);
        const addButtons = screen.getAllByRole("button", { name: /add below/i });
        const addButton = addButtons[1];
        await userEvent.click(addButton);
        expect(dcValues.action.addValueBelow).toHaveBeenCalledWith("dc:title", 1, "");
    });

    it("deletes rows", async () => {
        render(<DatastreamDublinCoreFieldGroup field="dc:title" />);
        const deleteButtons = screen.getAllByRole("button", { name: /delete row/i });
        const deleteButton = deleteButtons[0];
        await userEvent.click(deleteButton);
        expect(dcValues.action.deleteValue).toHaveBeenCalledWith("dc:title", 0);
    });

    it("saves values appropriately", async () => {
        render(<DatastreamDublinCoreFieldGroup field="dc:title" />);
        const inputs = screen.getAllByRole("textbox");
        const input = inputs[1];
        await userEvent.clear(input);
        await userEvent.type(input, "xyzzy");
        await userEvent.tab();
        expect(dcValues.action.replaceValue).toHaveBeenCalledWith("dc:title", 1, "xyzzy");
    });
});
