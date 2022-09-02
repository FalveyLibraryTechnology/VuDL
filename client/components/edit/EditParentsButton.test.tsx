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

describe("EditParentsButton", () => {
    let editorValues;
    let pid: string;
    beforeEach(() => {
        pid = "foo:123";
        editorValues = {
            action: {
                setParentsModalActivePid: jest.fn(),
                toggleParentsModal: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("renders", () => {
        const wrapper = shallow(<EditParentsButton pid={pid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("sets up modal on click", () => {
        const component = mount(<EditParentsButton pid={pid} />);
        component.find("button").simulate("click");

        expect(editorValues.action.setParentsModalActivePid).toHaveBeenCalledWith(pid);
        expect(editorValues.action.toggleParentsModal).toHaveBeenCalled();
        component.unmount();
    });
});
