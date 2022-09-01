import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import ParentPicker from "./ParentPicker";
import { waitFor } from "@testing-library/dom";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
const mockUseFetchContext = jest.fn();
jest.mock("../../../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));
jest.mock("../ObjectLoader", () => () => "ObjectLoader");
let setSelected = (pid: string) => {
    // This placeholder function should never get called,
    // but we'll implement it as a safety fallback.
    throw new Error("Unexpected call: " + pid);
};
jest.mock("../PidPicker", () => (args) => {
    setSelected = args.setSelected;
    return "PidPicker";
});

describe("ParentPicker", () => {
    let editorValues;
    let fetchValues;
    const pid = "foo:123";
    const parentPid = "foo:122";
    beforeEach(() => {
        editorValues = {
            state: {
                objectDetailsStorage: {},
            },
            action: {
                clearPidFromChildListStorage: jest.fn(),
                removeFromObjectDetailsStorage: jest.fn(),
                removeFromParentDetailsStorage: jest.fn(),
                setSnackbarState: jest.fn(),
            },
        };
        fetchValues = {
            action: {
                fetchText: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseFetchContext.mockReturnValue(fetchValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders correctly with no data loaded", () => {
        const wrapper = shallow(<ParentPicker pid={pid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly with a selected but unloaded parent", async () => {
        const wrapper = mount(<ParentPicker pid={pid} />);
        act(() => setSelected(parentPid));
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly with a selected, loaded, title-sorted parent", async () => {
        editorValues.state.objectDetailsStorage[parentPid] = {
            sortOn: "title",
        };
        const wrapper = mount(<ParentPicker pid={pid} />);
        act(() => setSelected(parentPid));
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("adds a title-sorted parent", async () => {
        fetchValues.action.fetchText.mockResolvedValue("ok");
        editorValues.state.objectDetailsStorage[parentPid] = {
            sortOn: "title",
        };
        const wrapper = mount(<ParentPicker pid={pid} />);
        act(() => setSelected(parentPid));
        wrapper.update();
        await act(async () => {
            wrapper.find("button").simulate("click");
            await waitFor(() => expect(editorValues.action.setSnackbarState).toHaveBeenCalled());
        });
        expect(fetchValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/object/foo%3A123/parent/foo%3A122",
            { body: "", method: "PUT" }
        );
        expect(editorValues.action.removeFromObjectDetailsStorage).toHaveBeenCalledWith(pid);
        expect(editorValues.action.removeFromParentDetailsStorage).toHaveBeenCalledWith(pid);
        expect(editorValues.action.clearPidFromChildListStorage).toHaveBeenCalledWith(parentPid);
        expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith({
            message: "Successfully added foo:123 to foo:122",
            open: true,
            severity: "info",
        });
    });

    it("renders correctly with a selected, loaded, custom-sorted parent", async () => {
        editorValues.state.objectDetailsStorage[parentPid] = {
            sortOn: "custom",
        };
        const wrapper = mount(<ParentPicker pid={pid} />);
        act(() => setSelected(parentPid));
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
