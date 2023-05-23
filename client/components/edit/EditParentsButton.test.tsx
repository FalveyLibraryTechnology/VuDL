import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import EditParentsButton from "./EditParentsButton";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

const mockUseGlobalContext = jest.fn();
jest.mock("../../context/GlobalContext", () => ({
    useGlobalContext: () => {
        return mockUseGlobalContext();
    },
}));

describe("EditParentsButton", () => {
    let editorValues;
    let globalValues;
    let pid: string;
    beforeEach(() => {
        pid = "foo:123";
        editorValues = {
            action: {
                setParentsModalActivePid: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        globalValues = {
            action: {
                openModal: jest.fn(),
            }
        }
        mockUseGlobalContext.mockReturnValue(globalValues);
    });

    it("renders", () => {
        const wrapper = shallow(<EditParentsButton pid={pid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("sets up modal on click", () => {
        const component = mount(<EditParentsButton pid={pid} />);
        component.find("button").simulate("click");

        expect(editorValues.action.setParentsModalActivePid).toHaveBeenCalledWith(pid);
        expect(globalValues.action.openModal).toHaveBeenCalledWith("parents");
        component.unmount();
    });
});
