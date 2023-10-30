import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import renderer from "react-test-renderer";
import DatastreamUploadModalContent from "./DatastreamUploadModalContent";

const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => mockUseDatastreamOperation());
const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("./DatastreamAgentsContent", () => () => {
    return "DatastreamAgentsContent";
});
jest.mock("./DatastreamLicenseContent", () => () => {
    return "DatastreamLicenseContent";
});

describe("DatastreamUploadModalContent", () => {
    let datastreamOperationValues;
    let editorValues;
    beforeEach(() => {
        editorValues = {
            state: {
                activeDatastream: "test1",
            },
        };
        datastreamOperationValues = {
            uploadFile: jest.fn(),
        };
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("renders", () => {
        const tree = renderer.create(<DatastreamUploadModalContent />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders DatastreamLicenseContent", () => {
        editorValues.state.activeDatastream = "LICENSE";

        const tree = renderer.create(<DatastreamUploadModalContent />).toJSON();
        expect(tree).toEqual("DatastreamLicenseContent");
    });

    it("renders DatastreamAgentContent", () => {
        editorValues.state.activeDatastream = "AGENTS";

        const tree = renderer.create(<DatastreamUploadModalContent />).toJSON();
        expect(tree).toEqual("DatastreamAgentsContent");
    });

    it("calls uploadFile on click", async () => {
        datastreamOperationValues.uploadFile.mockResolvedValue("upload worked");
        const wrapper = mount(<DatastreamUploadModalContent />);

        await act(async () => {
            wrapper.find(".uploadFileButton").simulate("change", {
                target: {
                    files: [
                        {
                            type: "image/png",
                        },
                    ],
                },
            });
            wrapper.update();
        });
        expect(datastreamOperationValues.uploadFile).toHaveBeenCalled();
    });
});
