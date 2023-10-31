import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import renderer from "react-test-renderer";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ParentsModal from "./ParentsModal";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("@mui/material/Dialog", () => (props) => props.children);
jest.mock("@mui/material/DialogContent", () => (props) => props.children);
jest.mock("@mui/material/DialogTitle", () => (props) => props.children);
jest.mock("@mui/material/Grid", () => (props) => props.children);
jest.mock("../ObjectLoader", () => (props) => "ObjectLoader: " + JSON.stringify(props));
jest.mock("./ParentList", () => (props) => "ParentList: " + JSON.stringify(props));
jest.mock("./ParentPicker", () => (props) => "ParentPicker: " + JSON.stringify(props));

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
        const tree = renderer.create(<ParentsModal />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders correctly for a loaded PID", () => {
        editorValues.state.objectDetailsStorage[pid] = { pid };
        const tree = renderer.create(<ParentsModal />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders correctly when PID is unset", () => {
        editorValues.state.parentsModalActivePid = null;
        const tree = renderer.create(<ParentsModal />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("toggles the modal", async () => {
        render(<ParentsModal />);
        await userEvent.setup().click(screen.getByRole("button"));
        expect(editorValues.action.toggleParentsModal).toHaveBeenCalled();
    });
});
