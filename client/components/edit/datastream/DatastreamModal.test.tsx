import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import DatastreamModal from "./DatastreamModal";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("./DatastreamUploadModalContent", () => () => "DatastreamUploadModalContent");
jest.mock("./DatastreamDeleteModalContent", () => () => "DatastreamDeleteModalContent");

describe("DatastreamModal", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            state: {
                datastreamModalState: "",
                isDatastreamModalOpen: true,
            },
            action: {
                toggleDatastreamModal: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamModal />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("toggles the datastreamModal", () => {
        const component = mount(<DatastreamModal />);
        component.find("button").simulate("click");

        expect(editorValues.action.toggleDatastreamModal).toHaveBeenCalled();
        component.unmount();
    });

    it("switches to the delete modal content", () => {
        editorValues.state.datastreamModalState = "Delete";

        const component = mount(<DatastreamModal />);

        expect(component.text()).toContain("DatastreamDeleteModalContent");
    });

    it("switches to the upload modal content", () => {
        editorValues.state.datastreamModalState = "Upload";

        const component = mount(<DatastreamModal />);

        expect(component.text()).toContain("DatastreamUploadModalContent");
    });
});
