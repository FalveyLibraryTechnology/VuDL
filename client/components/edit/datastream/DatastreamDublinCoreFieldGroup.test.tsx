import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import DatastreamDublinCoreFieldGroup from "./DatastreamDublinCoreFieldGroup";
import DatastreamDublinCoreEditField from "./DatastreamDublinCoreEditField";
import Delete from "@mui/icons-material/Delete";
import AddCircle from "@mui/icons-material/AddCircle";
import { act } from "react-dom/test-utils";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

describe("DatastreamDublinCoreFieldGroup", () => {
    let editorValues;

    beforeEach(() => {
        editorValues = {
            state: {
                currentDublinCore: {
                    "dc:identifier": ["foo"],
                    "dc:title": ["bar", "baz"],
                },
                dublinCoreFieldCatalog: {
                    "dc:identifier": { type: "locked" },
                    "dc:title": { type: "text" },
                },
            },
            action: {
                setCurrentDublinCore: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders unlocked fields", () => {
        const wrapper = shallow(<DatastreamDublinCoreFieldGroup field="dc:title" />);

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders locked fields", () => {
        const wrapper = shallow(<DatastreamDublinCoreFieldGroup field="dc:identifier" />);

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("inserts values above", () => {
        const wrapper = mount(<DatastreamDublinCoreFieldGroup field="dc:title" />);

        act(() => {
            wrapper.find(AddCircle).at(1).parent().props().onClick();
        });
        expect(editorValues.action.setCurrentDublinCore).toHaveBeenCalledWith({
            "dc:identifier": ["foo"],
            "dc:title": ["bar", "", "baz"],
        });
    });

    it("deletes rows", () => {
        const wrapper = mount(<DatastreamDublinCoreFieldGroup field="dc:title" />);

        act(() => {
            wrapper.find(Delete).at(0).parent().props().onClick();
        });
        expect(editorValues.action.setCurrentDublinCore).toHaveBeenCalledWith({
            "dc:identifier": ["foo"],
            "dc:title": ["baz"],
        });
    });

    it("saves values appropriately", () => {
        const wrapper = mount(<DatastreamDublinCoreFieldGroup field="dc:title" />);
        wrapper.find(DatastreamDublinCoreEditField).at(1).props().setValue("xyzzy");
        expect(editorValues.action.setCurrentDublinCore).toHaveBeenCalledWith({
            "dc:identifier": ["foo"],
            "dc:title": ["bar", "xyzzy"],
        });
    });
});
