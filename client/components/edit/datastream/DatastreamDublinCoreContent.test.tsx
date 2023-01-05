import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import DatastreamDublinCoreContent from "./DatastreamDublinCoreContent";
import Button from "@mui/material/Button";
import { act } from "react-dom/test-utils";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

const mockUseDublinCoreMetadataContext = jest.fn();
jest.mock("../../../context/DublinCoreMetadataContext", () => ({
    useDublinCoreMetadataContext: () => {
        return mockUseDublinCoreMetadataContext();
    },
}));

const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => mockUseDatastreamOperation());

jest.mock("./DatastreamDublinCoreValues", () => () => "DatastreamDublinCoreValues");
jest.mock("./DatastreamDublinCoreAddButtons", () => () => "DatastreamDublinCoreAddButtons");

describe("DatastreamDublinCoreContent ", () => {
    let dcValues;
    let editorValues;
    let pid;
    let uploadDublinCore;

    beforeEach(() => {
        pid = "foo";
        editorValues = {
            state: {
                currentPid: pid,
                objectDetailsStorage: {},
            },
            action: {
                toggleDatastreamsModel: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        uploadDublinCore = jest.fn();
        mockUseDatastreamOperation.mockReturnValue({ uploadDublinCore });
        dcValues = {
            state: {
                currentDublinCore: {},
            },
            action: {
                setCurrentDublinCore: jest.fn(),
            },
        };
        mockUseDublinCoreMetadataContext.mockReturnValue(dcValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamDublinCoreContent />);

        expect(toJson(wrapper)).toMatchSnapshot();
        // Our default data has nothing loaded, and current DC shouldn't be set
        // until data loads.
        expect(dcValues.action.setCurrentDublinCore).not.toHaveBeenCalled();
    });

    it("correctly loads data", () => {
        const metadata = { "dc:title": ["foo"] };
        editorValues.state.objectDetailsStorage[pid] = { metadata };
        mount(<DatastreamDublinCoreContent />);
        expect(dcValues.action.setCurrentDublinCore).toHaveBeenCalledWith(metadata);
    });

    it("correctly defaults to empty data when none is provided", () => {
        editorValues.state.objectDetailsStorage[pid] = {};
        mount(<DatastreamDublinCoreContent />);
        expect(dcValues.action.setCurrentDublinCore).toHaveBeenCalledWith({});
    });

    it("correctly uploads data", () => {
        const metadata = { "dc:title": ["foo"] };
        dcValues.state.currentDublinCore = metadata;
        const wrapper = mount(<DatastreamDublinCoreContent />);
        act(() => {
            wrapper.find(Button).at(0).props().onClick();
        });
        expect(uploadDublinCore).toHaveBeenCalledWith(metadata);
    });
});
