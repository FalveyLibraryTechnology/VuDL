import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamDeleteModalContent from "./DatastreamDeleteModalContent";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => mockUseDatastreamOperation());
describe("DatastreamDeleteModalContent", () => {
    let editorValues;
    let datastreamOperationValues;
    beforeEach(() => {
        editorValues = {
            state: {
                currentPid: "vudl:123",
                activeDatastream: "THUMBNAIL",
            },
            action: {
                getCurrentModelsDatastreams: jest.fn().mockResolvedValue({}),
                setSnackbarState: jest.fn(),
                toggleDatastreamModal: jest.fn(),
            },
        };
        datastreamOperationValues = {
            deleteDatastream: jest.fn(),
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamDeleteModalContent />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("calls deleteDatastream", async () => {
        const wrapper = mount(<DatastreamDeleteModalContent />);
        await act(async () => {
            wrapper.find("button.yesButton").simulate("click");
            wrapper.update();
        });

        expect(datastreamOperationValues.deleteDatastream).toHaveBeenCalled();
    });
});
