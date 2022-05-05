import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamUploadModalContent from "./DatastreamUploadModalContent";

const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => mockUseDatastreamOperation());
const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
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
        const wrapper = shallow(<DatastreamUploadModalContent />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders DatastreamLicenseContent", () => {
        editorValues.state.activeDatastream = "LICENSE";

        const wrapper = mount(<DatastreamUploadModalContent />);

        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.text()).toContain("DatastreamLicenseContent");
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
