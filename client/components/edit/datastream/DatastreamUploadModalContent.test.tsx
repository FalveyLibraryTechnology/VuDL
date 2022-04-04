import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamUploadModalContent from "./DatastreamUploadModalContent";

const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => mockUseDatastreamOperation());

describe("DatastreamUploadModalContent", () => {
    let datastreamOperationValues;
    beforeEach(() => {
        datastreamOperationValues = {
            uploadFile: jest.fn(),
        };
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamUploadModalContent />);
        expect(toJson(wrapper)).toMatchSnapshot();
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
