import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamControlButton from "./DatastreamControlButton";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => mockUseDatastreamOperation());
describe("DatastreamControlButton", () => {
    let editorValues;
    let datastreamOperationValues;
    beforeEach(() => {
        editorValues = {
            action: {
                toggleDatastreamModal: jest.fn(),
                setActiveDatastream: jest.fn(),
                setDatastreamModalState: jest.fn(),
            },
        };
        datastreamOperationValues = {
            downloadDatastream: jest.fn(),
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamControlButton modalState="Upload" datastream="THUMBNAIL" />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("downloads the datastream", async () => {
        const wrapper = mount(<DatastreamControlButton modalState="Download" datastream="THUMBNAIL" />);
        await act(async () => {
            wrapper.find("button.datastreamControlButton").simulate("click");
            wrapper.update();
        });
        expect(datastreamOperationValues.downloadDatastream).toHaveBeenCalledWith("THUMBNAIL");
    });

    it("activates the modal", async () => {
        const wrapper = mount(<DatastreamControlButton modalState="View" datastream="THUMBNAIL" />);
        await act(async () => {
            wrapper.find("button.datastreamControlButton").simulate("click");
            wrapper.update();
        });
        expect(editorValues.action.setActiveDatastream).toHaveBeenCalledWith("THUMBNAIL");
        expect(editorValues.action.setDatastreamModalState).toHaveBeenCalledWith("View");
        expect(editorValues.action.toggleDatastreamModal).toHaveBeenCalled();
    });
});
