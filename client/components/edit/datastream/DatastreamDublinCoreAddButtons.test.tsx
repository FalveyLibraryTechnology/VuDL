import { describe, afterEach, expect, it, jest } from "@jest/globals";
import userEvent from "@testing-library/user-event";
import { render, act, screen } from "@testing-library/react";
import DatastreamDublinCoreAddButtons from "./DatastreamDublinCoreAddButtons";
import { waitFor } from "@testing-library/react";

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

let setSelectedGlobal;
jest.mock("../PidPicker", () => (props) => {
    setSelectedGlobal = props.setSelected;
    return "PidPicker: " + JSON.stringify(props);
});

describe("DatastreamDublinCoreAddButtons", () => {
    let dcValues;
    let editorValues;
    const pid = "foo:123";

    beforeEach(() => {
        editorValues = {
            state: {
                currentPid: pid,
                dublinCoreFieldCatalog: {
                    "dc:identifier": { type: "locked" },
                    "dc:title": { type: "text" },
                    "dc:description": { type: "html" },
                },
                objectDetailsStorage: {},
                parentDetailsStorage: {},
            },
            action: {
                loadObjectDetailsIntoStorage: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        dcValues = {
            action: {
                addValueAbove: jest.fn(),
                mergeValues: jest.fn(),
            },
        };
        mockUseDublinCoreMetadataContext.mockReturnValue(dcValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders without selected clone pid", () => {
        const { asFragment } = render(<DatastreamDublinCoreAddButtons />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders with selected clone pid", () => {
        editorValues.state.objectDetailsStorage["foo"] = {};
        const { asFragment } = render(<DatastreamDublinCoreAddButtons />);
        act(() => {
            setSelectedGlobal("foo");
        });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders with appropriate parent details (using shallow storage)", () => {
        editorValues.state.parentDetailsStorage[pid] = {
            shallow: {
                parents: [{ pid: "parent:123", title: "Parent" }],
            },
        };
        const { asFragment } = render(<DatastreamDublinCoreAddButtons />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders with appropriate parent details (using full storage)", () => {
        editorValues.state.parentDetailsStorage[pid] = {
            full: {
                parents: [{ pid: "parent:123", title: "Parent" }],
            },
        };
        const { asFragment } = render(<DatastreamDublinCoreAddButtons />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("adds new fields on click", async () => {
        await act(async () => {
            render(<DatastreamDublinCoreAddButtons />);
        });
        await userEvent.setup().click(screen.getAllByRole("button")[1]);
        expect(dcValues.action.addValueAbove).toHaveBeenCalledWith("dc:description", 0, "");
    });

    it("loads details for cloned pids", async () => {
        render(<DatastreamDublinCoreAddButtons />);
        await act(async () => {
            await setSelectedGlobal("foo");
            await waitFor(() => expect(editorValues.action.loadObjectDetailsIntoStorage).toHaveBeenCalled());
        });
        expect(editorValues.action.loadObjectDetailsIntoStorage).toHaveBeenCalledWith("foo", expect.anything());
    });

    it("clones metadata", async () => {
        editorValues.state.objectDetailsStorage["foo"] = {
            metadata: { "dc:identifier": ["foo"], "dc:title": ["added"], "dc:description": ["bar"] },
        };
        render(<DatastreamDublinCoreAddButtons />);
        await act(async () => {
            await setSelectedGlobal("foo");
        });
        await userEvent.setup().click(screen.getAllByRole("button")[2]);
        expect(dcValues.action.mergeValues).toHaveBeenCalledWith({
            "dc:title": ["added"],
            "dc:description": ["bar"],
        });
    });
});
