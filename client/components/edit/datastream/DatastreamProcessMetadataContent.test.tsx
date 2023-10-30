import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { mount } from "enzyme";
import renderer from "react-test-renderer";
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

const DatastreamProcessMetadataTask = function DatastreamProcessMetadataTask() {
    return "";
};
jest.mock("./DatastreamProcessMetadataTask", () => DatastreamProcessMetadataTask);

jest.mock("@mui/x-date-pickers", () => ({
    DateTimePicker: () => "DateTimePicker",
    LocalizationProvider: () => "LocalizationProvider",
}));

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

    const getRenderedTree = async (fakeData = {}) => {
        datastreamOperationValues.getProcessMetadata.mockResolvedValue(fakeData);
        processMetadataValues.state = fakeData;

        const tree = renderer.create(<DatastreamProcessMetadataContent />);

        await renderer.act(async () => {
            await waitFor(() => expect(processMetadataValues.action.setMetadata).toHaveBeenCalledWith(fakeData));
        });

        return tree.toJSON();
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
        datastreamOperationValues.getProcessMetadata.mockResolvedValue({});
        const tree = renderer.create(<DatastreamProcessMetadataContent />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders a form when empty data is loaded", async () => {
        const tree = await getRenderedTree();
        expect(processMetadataValues.action.addTask).toHaveBeenCalledWith(0);
        expect(tree).toMatchSnapshot();
    });

    it("renders a form when non-empty data is loaded", async () => {
        const tree = await getRenderedTree({
            processLabel: "label",
            processCreator: "creator",
            processDateTime: "datetime",
            processOrganization: "organization",
            tasks: [{ id: 1 }, { id: 2 }],
        });
        expect(processMetadataValues.action.addTask).not.toHaveBeenCalled();
        expect(tree).toMatchSnapshot();
    });

    it("has a working save button", async () => {
        const wrapper = await getMountedComponent();
        await wrapper.find(".uploadProcessMetadataButton").find(Button).props().onClick();
        expect(datastreamOperationValues.uploadProcessMetadata).toHaveBeenCalledWith(processMetadataValues.state);
    });

    it("supports task updates", async () => {
        const wrapper = await getMountedComponent({ tasks: [{ id: 1 }] });
        const attr = { foo: "bar" };
        wrapper.find(DatastreamProcessMetadataTask).props().setAttributes(attr, true);
        expect(processMetadataValues.action.updateTaskAttributes).toHaveBeenCalledWith(0, attr);
    });

    it("supports adding tasks", async () => {
        const wrapper = await getMountedComponent({ tasks: [{ id: 1 }] });
        wrapper.find(DatastreamProcessMetadataTask).props().addBelow();
        expect(processMetadataValues.action.addTask).toHaveBeenCalledWith(1);
    });

    it("supports deleting tasks", async () => {
        const wrapper = await getMountedComponent({ tasks: [{ id: 1 }] });
        wrapper.find(DatastreamProcessMetadataTask).props().deleteTask();
        expect(processMetadataValues.action.deleteTask).toHaveBeenCalledWith(0);
    });
});
