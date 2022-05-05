import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamLicenseContent from "./DatastreamLicenseContent";

jest.mock("@mui/material/RadioGroup", () => () => "RadioGroup");
const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => {
    return mockUseDatastreamOperation();
});

describe("DatastreamLicenseContent", () => {
    let editorValues;
    let datastreamOperationValues;
    beforeEach(() => {
        editorValues = {
            state: {
                licensesCatalog: {
                    testLicenseKey: {
                        name: "testLicense",
                    },
                },
            },
            action: {
                toggleDatastreamModal: jest.fn(),
            },
        };
        datastreamOperationValues = {
            uploadLicense: jest.fn(),
            getLicenseKey: jest.fn(),
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamLicenseContent />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("calls uploadLicense on click", async () => {
        datastreamOperationValues.uploadLicense.mockResolvedValue("upload worked");
        const wrapper = mount(<DatastreamLicenseContent />);

        await act(async () => {
            wrapper.find("button.uploadLicenseButton").simulate("click");
            wrapper.update();
        });
        expect(datastreamOperationValues.getLicenseKey).toHaveBeenCalled();
        expect(datastreamOperationValues.uploadLicense).toHaveBeenCalled();
    });
});
