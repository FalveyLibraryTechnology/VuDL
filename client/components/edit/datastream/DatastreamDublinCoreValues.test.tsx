import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import DatastreamDublinCoreValues from "./DatastreamDublinCoreValues";

jest.mock("./DatastreamDublinCoreFieldGroup", () => (props) => {
    // Mock the field group so it just returns the value of its field property:
    return props.field;
});

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

describe("DatastreamDublinCoreValues", () => {
    let dcValues;
    let editorValues;

    beforeEach(() => {
        editorValues = {
            state: {
                dublinCoreFieldCatalog: {
                    "dc:identifier": { type: "locked" },
                    "dc:title": { type: "text" },
                    "dc:description": { type: "html" },
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
            },
        };
        mockUseDublinCoreMetadataContext.mockReturnValue(dcValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders a field group for each field type in the current Dublin Core", () => {
        const { asFragment } = render(<DatastreamDublinCoreValues />);
        expect(asFragment().textContent.includes("dc:identifier")).toBeTruthy();
        expect(asFragment().textContent.includes("dc:title")).toBeTruthy();
    });
});
