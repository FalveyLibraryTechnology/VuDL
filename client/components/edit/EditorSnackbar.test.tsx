import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import EditorSnackbar from "./EditorSnackbar";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("./ChildList", () => () => "ChildList");

describe("EditorSnackbar", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            state: {
                snackbarState: {
                    message: "test1",
                    open: true,
                    severity: "info",
                },
            },
            action: {
                setSnackbarState: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("renders", () => {
        const wrapper = shallow(<EditorSnackbar />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("closes", () => {
        const component = mount(<EditorSnackbar />);

        component.find("button.editorSnackBarAlertCloseButton").simulate("click");

        expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith({
            open: false,
            message: "",
            severity: "info",
        });
    });
});
