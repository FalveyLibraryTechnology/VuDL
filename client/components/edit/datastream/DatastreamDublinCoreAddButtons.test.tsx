import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { shallow } from "enzyme";
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
});
