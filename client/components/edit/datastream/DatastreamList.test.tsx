import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import DatastreamList from "./DatastreamList";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
const mockDatastream = jest.fn();
jest.mock("./Datastream", () => (props) => {
    mockDatastream(props);
    return "Datastream";
});

describe("DatastreamList", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            state: {
                modelsDatastreams: ["test1"],
            },
            action: {
                getCurrentObjectDetails: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("renders", () => {
        const wrapper = mount(<DatastreamList />);
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(mockDatastream).toHaveBeenCalledWith({
            datastream: "test1",
        });
        expect(editorValues.action.getCurrentObjectDetails).toHaveBeenCalled();
    });
});
