import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamViewModalContent from "./DatastreamViewModalContent";
import { waitFor } from "@testing-library/react";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => mockUseDatastreamOperation());
const mockDatatypeContent = jest.fn();
jest.mock("../../shared/DatatypeContent", () => (props) => {
    mockDatatypeContent(props);
    return "DatatypeContent";
});
describe("DatastreamViewModalContent", () => {
    let datastreamOperationValues;
    let editorValues;
    let data;
    let createObjectURL;
    beforeEach(() => {
        datastreamOperationValues = {
            viewDatastream: jest.fn(),
        };
        data = "test3";
        createObjectURL = jest.fn().mockReturnValue(data);
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
        Object.defineProperty(global, "URL", {
            value: {
                createObjectURL,
            },
            writable: true,
        });
        editorValues = {
            state: {
                activeDatastream: "foo",
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("renders for viewable content", async () => {
        const response = {
            data: "test1",
            mimeType: "test2",
        };
        datastreamOperationValues.viewDatastream.mockResolvedValue(response);
        let wrapper;
        await act(async () => {
            wrapper = await mount(<DatastreamViewModalContent />);
        });
        await waitFor(() => expect(datastreamOperationValues.viewDatastream).toHaveBeenCalled());
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(mockDatatypeContent).toHaveBeenCalledWith(response);
    });

    it("renders for download-only content", async () => {
        const response = {
            data: "test1",
            mimeType: "image/tiff",
        };
        datastreamOperationValues.viewDatastream.mockResolvedValue(response);
        let wrapper;
        await act(async () => {
            wrapper = await mount(<DatastreamViewModalContent />);
        });
        await waitFor(() => expect(datastreamOperationValues.viewDatastream).toHaveBeenCalled());
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(mockDatatypeContent).not.toHaveBeenCalled();
    });
});
