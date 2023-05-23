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
const mockUseGlobalContext = jest.fn();
jest.mock("../../../context/GlobalContext", () => ({
    useGlobalContext: () => {
        return mockUseGlobalContext();
    },
}));
jest.mock("./DatastreamUploadModalContent", () => () => "DatastreamUploadModalContent");
jest.mock("./DatastreamDeleteModalContent", () => () => "DatastreamDeleteModalContent");

describe("DatastreamModal", () => {
    let editorValues;
    let globalValues;
    beforeEach(() => {
        editorValues = {
            state: {
                datastreamModalState: "",
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        globalValues = {
            action: {
                closeModal: jest.fn(),
                isModalOpen: jest.fn(),
            }
        }
        mockUseGlobalContext.mockReturnValue(globalValues);
        globalValues.action.isModalOpen.mockReturnValue(true);
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamModal />);
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(globalValues.action.isModalOpen).toHaveBeenCalledWith("datastream");
    });

    it("toggles the datastreamModal", () => {
        const component = mount(<DatastreamModal />);
        component.find("button").simulate("click");

        expect(globalValues.action.isModalOpen).toHaveBeenCalledWith("datastream");
        expect(globalValues.action.closeModal).toHaveBeenCalledWith("datastream");
        component.unmount();
    });

    it("switches to the delete modal content", () => {
        editorValues.state.datastreamModalState = "Delete";

        const component = mount(<DatastreamModal />);

        expect(component.text()).toContain("DatastreamDeleteModalContent");
        expect(globalValues.action.isModalOpen).toHaveBeenCalledWith("datastream");
    });

    it("switches to the upload modal content", () => {
        editorValues.state.datastreamModalState = "Upload";

        const component = mount(<DatastreamModal />);

        expect(component.text()).toContain("DatastreamUploadModalContent");
        expect(globalValues.action.isModalOpen).toHaveBeenCalledWith("datastream");
    });
});
