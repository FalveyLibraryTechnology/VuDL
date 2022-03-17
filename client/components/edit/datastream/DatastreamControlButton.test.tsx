import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import DatastreamControlButton from "./DatastreamControlButton";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
describe("DatastreamControlButton", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            action: {
                toggleDatastreamModal: jest.fn(),
                setActiveDatastream: jest.fn(),
                setDatastreamModalState: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });
    it("renders", () => {
        const wrapper = shallow(<DatastreamControlButton modalState="Upload" datastream="THUMBNAIL" />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
