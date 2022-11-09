import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import DatastreamProcessMetadataContent from "./DatastreamProcessMetadataContent";

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

    beforeEach(() => {
        datastreamOperationValues = {
            uploadProcessMetadata: jest.fn(),
            getProcessMetadata: jest.fn(),
        };
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
        editorValues = { action: { toggleDatastreamModal: jest.fn() } };
        mockUseEditorContext.mockReturnValue(editorValues);
        processMetadataValues = {
            state: {
                processMetadata: {},
            },
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
});
