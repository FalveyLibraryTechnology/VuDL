import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import DatastreamDublinCoreFieldGroup from "./DatastreamDublinCoreFieldGroup";

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
});
