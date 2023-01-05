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

const mockUseDublinCoreMetadataContext = jest.fn();
jest.mock("../../../context/DublinCoreMetadataContext", () => ({
    useDublinCoreMetadataContext: () => {
        return mockUseDublinCoreMetadataContext();
    },
}));

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
        expect(dcValues.action.addValueBelow).toHaveBeenCalledWith("dc:title", 1, "");
    });

    it("deletes rows", () => {
        const wrapper = mount(<DatastreamDublinCoreFieldGroup field="dc:title" />);

        act(() => {
            wrapper.find(Delete).at(0).parent().props().onClick();
        });
        expect(dcValues.action.deleteValue).toHaveBeenCalledWith("dc:title", 0);
    });

    it("saves values appropriately", () => {
        const wrapper = mount(<DatastreamDublinCoreFieldGroup field="dc:title" />);
        wrapper.find(DatastreamDublinCoreEditField).at(1).props().setValue("xyzzy");
        expect(dcValues.action.replaceValue).toHaveBeenCalledWith("dc:title", 1, "xyzzy");
    });
});
