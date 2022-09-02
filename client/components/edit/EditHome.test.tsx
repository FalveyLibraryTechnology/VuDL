import React from "react";
import { describe, expect, it } from "@jest/globals";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import EditHome from "./EditHome";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

jest.mock("./children/ChildList", () => () => "ChildList");
jest.mock("./EditorSnackbar", () => () => "EditorSnackbar");
jest.mock("./parents/ParentsModal", () => () => "ParentsModal");
jest.mock("./StateModal", () => () => "StateModal");

describe("EditHome", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            action: {
                initializeCatalog: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });
    it("renders", () => {
        const wrapper = mount(<EditHome />);
        expect(editorValues.action.initializeCatalog).toHaveBeenCalled();
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
