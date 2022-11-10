import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import DatastreamProcessMetadataContent from "./DatastreamProcessMetadataContent";
import { waitFor } from "@testing-library/react";
import Button from "@mui/material/Button";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

const mockUseProcessMetadataContext = jest.fn();
jest.mock("../../../context/ProcessMetadataContext", () => ({
    useProcessMetadataContext: () => {
        return mockUseProcessMetadataContext();
    },
}));

const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => {
    return mockUseDatastreamOperation();
});

jest.mock("./DatastreamProcessMetadataTask", () => () => "DatastreamProcessMetadataTask");

describe("DatastreamProcessMetadataContent", () => {
    let datastreamOperationValues;
    let editorValues;
    let processMetadataValues;

    const getMountedComponent = async (fakeData = {}) => {
        datastreamOperationValues.getProcessMetadata.mockResolvedValue(fakeData);
        processMetadataValues.state = fakeData;

        const wrapper = mount(<DatastreamProcessMetadataContent />);

        await waitFor(() => expect(processMetadataValues.action.setMetadata).toHaveBeenCalledWith(fakeData));

        wrapper.update();

        return wrapper;
    };

    beforeEach(() => {
        datastreamOperationValues = {
            uploadProcessMetadata: jest.fn(),
            getProcessMetadata: jest.fn(),
        };
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
        editorValues = { action: { toggleDatastreamModal: jest.fn() } };
        mockUseEditorContext.mockReturnValue(editorValues);
        processMetadataValues = {
            state: {},
            action: {
                addTask: jest.fn(),
                deleteTask: jest.fn(),
                setMetadata: jest.fn(),
                setProcessCreator: jest.fn(),
                setProcessDateTime: jest.fn(),
                setProcessLabel: jest.fn(),
                setProcessOrganization: jest.fn(),
                updateTaskAttributes: jest.fn(),
            },
        };
        mockUseProcessMetadataContext.mockReturnValue(processMetadataValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders a loading message if content is unavailable", () => {
        const wrapper = shallow(<DatastreamProcessMetadataContent />);

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders a form when empty data is loaded", async () => {
        const wrapper = await getMountedComponent();
        expect(processMetadataValues.action.addTask).toHaveBeenCalledWith(0);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders a form when non-empty data is loaded", async () => {
        const wrapper = await getMountedComponent({
            processLabel: "label",
            processCreator: "creator",
            processDateTime: "datetime",
            processOrganization: "organization",
            tasks: [{ id: 1 }, { id: 2 }],
        });
        expect(processMetadataValues.action.addTask).not.toHaveBeenCalled();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("has a working save button", async () => {
        const wrapper = await getMountedComponent();
        await wrapper.find(".uploadProcessMetadataButton").find(Button).props().onClick();
        expect(datastreamOperationValues.uploadProcessMetadata).toHaveBeenCalledWith(processMetadataValues.state);
    });
});
