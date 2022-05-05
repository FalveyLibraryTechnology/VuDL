import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import ObjectEditor from "./ObjectEditor";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("./children/ChildList", () => () => "ChildList");
jest.mock("./Breadcrumbs", () => () => "Breadcrumbs");
jest.mock("./datastream/DatastreamList", () => () => "DatastreamList");
jest.mock("./datastream/DatastreamModal", () => () => "DatastreamModal");
jest.mock("./ObjectSummary", () => () => "ObjectSummary");
jest.mock("./EditorSnackbar", () => () => "EditorSnackbar");

describe("ObjectEditor", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            action: {
                initializeCatalog: jest.fn(),
                loadObjectDetails: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });
    it("renders", () => {
        const wrapper = shallow(<ObjectEditor pid="foo:123" />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("calls initializeCatalog", () => {
        mount(<ObjectEditor pid="foo:123" />);
        expect(editorValues.action.initializeCatalog).toHaveBeenCalled();
        expect(editorValues.action.loadObjectDetails).toHaveBeenCalledWith("foo:123");
    });
});
