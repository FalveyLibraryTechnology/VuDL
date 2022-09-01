import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import ParentPicker from "./ParentPicker";

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
    let pid: string;
    beforeEach(() => {
        pid = "foo:123";
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
        act(() => setSelected("foo:122"));
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly with a selected, loaded, title-sorted parent", async () => {
        editorValues.state.objectDetailsStorage["foo:122"] = {
            sortOn: "title",
        };
        const wrapper = mount(<ParentPicker pid={pid} />);
        act(() => setSelected("foo:122"));
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly with a selected, loaded, custom-sorted parent", async () => {
        editorValues.state.objectDetailsStorage["foo:122"] = {
            sortOn: "custom",
        };
        const wrapper = mount(<ParentPicker pid={pid} />);
        act(() => setSelected("foo:122"));
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
