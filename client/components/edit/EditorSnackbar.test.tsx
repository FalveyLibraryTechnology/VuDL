import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import EditorSnackbar from "./EditorSnackbar";

const mockUseGlobalContext = jest.fn();
jest.mock("../../context/GlobalContext", () => ({
    useGlobalContext: () => {
        return mockUseGlobalContext();
    },
}));
const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("./children/ChildList", () => () => "ChildList");

describe("EditorSnackbar", () => {
    let globalValues;
    beforeEach(() => {
        globalValues = {
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
        mockUseGlobalContext.mockReturnValue(globalValues);
    });

    it("renders", () => {
        const wrapper = shallow(<EditorSnackbar />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("closes", () => {
        const component = mount(<EditorSnackbar />);

        component.find("button.editorSnackBarAlertCloseButton").simulate("click");

        expect(globalValues.action.setSnackbarState).toHaveBeenCalledWith({
            open: false,
            message: "",
            severity: "info",
        });
    });
});
