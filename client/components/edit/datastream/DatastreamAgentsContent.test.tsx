import React from "react";
import { setImmediate } from "timers";
import { describe, beforeEach, afterEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamAgentsContent from "./DatastreamAgentsContent";

const mockDatastreamAgentsModifyContentRow = jest.fn();
jest.mock("./DatastreamAgentsModifyContentRow", () => (props) => {
    mockDatastreamAgentsModifyContentRow(props);
    return "DatastreamAgentsModifyContentRow";
});
const mockDatastreamAgentsAddContentRow = jest.fn();
jest.mock("./DatastreamAgentsAddContentRow", () => (props) => {
    mockDatastreamAgentsAddContentRow(props);
    return "DatastreamAgentsAddContentRow";
});
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

describe("DatastreamAgentsContent", () => {
    let editorValues;
    let datastreamOperationValues;
    beforeEach(() => {
        editorValues = {
            state: {
                agentsCatalog: {
                    defaults: {
                        role: "test1",
                        type: "test2",
                        name: "test3",
                    },
                },
                currentAgents: [],
            },
            action: {
                setCurrentAgents: jest.fn(),
                toggleDatastreamModal: jest.fn(),
            },
        };
        datastreamOperationValues = {
            uploadAgents: jest.fn(),
            getAgents: jest.fn(),
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamAgentsContent />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("calls getAgents on render", async () => {
        datastreamOperationValues.getAgents.mockResolvedValue([]);

        const wrapper = mount(<DatastreamAgentsContent />);
        await act(async () => {
            await Promise.resolve(wrapper);
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        expect(datastreamOperationValues.getAgents).toHaveBeenCalled();
        expect(editorValues.action.setCurrentAgents).toHaveBeenCalled();
    });

    it("saves current changes on save changes click", async () => {
        datastreamOperationValues.getAgents.mockResolvedValue([]);

        const wrapper = mount(<DatastreamAgentsContent />);
        await act(async () => {
            await Promise.resolve(wrapper);
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
            wrapper.find("button.agentsSaveChangesButton").simulate("click");
        });

        expect(datastreamOperationValues.uploadAgents).toHaveBeenCalled();
        expect(editorValues.action.toggleDatastreamModal).not.toHaveBeenCalled();
    });

    it("saves current agents and closes the modal", async () => {
        datastreamOperationValues.getAgents.mockResolvedValue([]);

        const wrapper = mount(<DatastreamAgentsContent />);
        await act(async () => {
            await Promise.resolve(wrapper);
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
            wrapper.find("button.agentsSaveCloseButton").simulate("click");
        });

        expect(datastreamOperationValues.uploadAgents).toHaveBeenCalled();
        expect(editorValues.action.toggleDatastreamModal).toHaveBeenCalled();
    });

    it("resets current agents on cancel", async () => {
        datastreamOperationValues.getAgents.mockResolvedValue([]);

        const wrapper = mount(<DatastreamAgentsContent />);
        await act(async () => {
            await Promise.resolve(wrapper);
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.find("button.agentsCancelButton").simulate("click");
            wrapper.update();
        });

        expect(datastreamOperationValues.uploadAgents).not.toHaveBeenCalled();
        expect(datastreamOperationValues.getAgents).toHaveBeenCalled();
        expect(editorValues.action.setCurrentAgents).toHaveBeenCalled();
        expect(editorValues.action.toggleDatastreamModal).toHaveBeenCalled();
    });
});
