import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import DatastreamDublinCoreValues from "./DatastreamDublinCoreValues";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

describe("DatastreamDublinCoreValues", () => {
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
                    "dc:description": { type: "html" },
                },
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamDublinCoreValues />);

        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
