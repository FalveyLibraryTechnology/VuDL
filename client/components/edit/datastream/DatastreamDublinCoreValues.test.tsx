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

    it("renders", () => {
        const wrapper = shallow(<DatastreamDublinCoreValues />);

        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
