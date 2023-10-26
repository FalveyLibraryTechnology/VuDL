import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ParentsModal from "./ParentsModal";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("../ObjectLoader", () => () => "ObjectLoader");
jest.mock("./ParentList", () => () => "ParentList");
jest.mock("./ParentPicker", () => () => "ParentPicker");

describe("ParentsModal", () => {
    let editorValues;
    let pid: string;
    beforeEach(() => {
        pid = "foo:123";
        editorValues = {
            state: {
                objectDetailsStorage: {},
                isParentsModalOpen: true,
                parentsModalActivePid: pid,
            },
            action: {
                toggleParentsModal: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("renders correctly for a non-loaded PID", () => {
        const wrapper = shallow(<ParentsModal />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly for a loaded PID", () => {
        editorValues.state.objectDetailsStorage[pid] = { pid };
        const wrapper = shallow(<ParentsModal />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly when PID is unset", () => {
        editorValues.state.parentsModalActivePid = null;
        const wrapper = shallow(<ParentsModal />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("toggles the modal", async () => {
        render(<ParentsModal />);
        await userEvent.setup().click(screen.getByRole("button"));
        expect(editorValues.action.toggleParentsModal).toHaveBeenCalled();
    });
});
