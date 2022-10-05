import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamDublinCoreAddButtons from "./DatastreamDublinCoreAddButtons";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

jest.mock("../PidPicker", () => () => "PidPicker");

describe("DatastreamDublinCoreAddButtons", () => {
    let editorValues;

    beforeEach(() => {
        editorValues = {
            state: {
                currentDublinCore: {},
                dublinCoreFieldCatalog: {
                    "dc:identifier": { type: "locked" },
                    "dc:title": { type: "text" },
                    "dc:description": { type: "html" },
                },
                objectDetailsStorage: {},
            },
            action: {
                loadObjectDetailsIntoStorage: jest.fn(),
                setCurrentDublinCore: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders without selected clone pid", () => {
        const wrapper = shallow(<DatastreamDublinCoreAddButtons />);

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders with selected clone pid", () => {
        editorValues.state.objectDetailsStorage["foo"] = {};
        const wrapper = shallow(<DatastreamDublinCoreAddButtons />);
        act(() => {
            wrapper.children().at(4).props().setSelected("foo");
        });
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("adds to existing fields on click", () => {
        editorValues.state.currentDublinCore = { "dc:identifier": ["baz"], "dc:title": ["original"] };
        const wrapper = mount(<DatastreamDublinCoreAddButtons />);
        act(() => {
            wrapper.find("button").at(0).props().onClick();
        });
        expect(editorValues.action.setCurrentDublinCore).toHaveBeenCalledWith({
            "dc:identifier": ["baz"],
            "dc:title": ["original", ""],
        });
    });

    it("adds new fields on click", () => {
        editorValues.state.currentDublinCore = { "dc:identifier": ["baz"], "dc:title": ["original"] };
        const wrapper = mount(<DatastreamDublinCoreAddButtons />);
        act(() => {
            wrapper.find("button").at(1).props().onClick();
        });
        expect(editorValues.action.setCurrentDublinCore).toHaveBeenCalledWith({
            "dc:identifier": ["baz"],
            "dc:title": ["original"],
            "dc:description": [""],
        });
    });

    it("loads details for cloned pids", async () => {
        const wrapper = mount(<DatastreamDublinCoreAddButtons />);
        await act(async () => {
            await wrapper.children().at(4).props().setSelected("foo");
        });
        expect(editorValues.action.loadObjectDetailsIntoStorage).toHaveBeenCalledWith("foo", expect.anything());
    });

    it("clones metadata", () => {
        editorValues.state.currentDublinCore = { "dc:identifier": ["baz"], "dc:title": ["original"] };
        editorValues.state.objectDetailsStorage["foo"] = {
            metadata: { "dc:identifier": ["foo"], "dc:title": ["added"], "dc:description": ["bar"] },
        };
        const wrapper = mount(<DatastreamDublinCoreAddButtons />);
        act(() => {
            wrapper.children().at(4).props().setSelected("foo");
        });
        wrapper.update();
        act(() => {
            wrapper.find("button").at(2).props().onClick();
        });
        expect(editorValues.action.setCurrentDublinCore).toHaveBeenCalledWith({
            "dc:identifier": ["baz"],
            "dc:title": ["original", "added"],
            "dc:description": ["bar"],
        });
    });
});
