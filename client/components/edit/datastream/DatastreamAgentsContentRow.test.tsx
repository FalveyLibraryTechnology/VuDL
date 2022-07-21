import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamAgentsContentRow from "./DatastreamAgentsContentRow";

const mockDatastreamAgentsContentNotes = jest.fn();
jest.mock("./DatastreamAgentsContentNotes", () => (props) => {
    mockDatastreamAgentsContentNotes(props);
    return "DatastreamAgentsContentNotes";
});
const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

describe("DatastreamAgentsContentRow", () => {
    let agent;
    let props;
    let editorValues;

    beforeEach(() => {
        agent = {
            role: "test1",
            type: "test2",
            name: "test3",
            notes: ["test4"],
        };
        props = {
            initialExpand: false,
            agent,
            onRoleChange: jest.fn(),
            onTypeChange: jest.fn(),
            onNameChange: jest.fn(),
            onNotesChange: jest.fn(),
        };
        editorValues = {
            state: {
                agentsCatalog: {
                    types: ["type1"],
                    roles: ["role1"],
                    defaults: {
                        role: "test1",
                        type: "test2",
                        name: "test3",
                    },
                },
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamAgentsContentRow {...props} />);

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("changes a role", () => {
        const wrapper = mount(<DatastreamAgentsContentRow {...props} />);
        act(() => {
            wrapper.find(".agentRoleSelect select").simulate("change", { target: { value: "test" } });
            wrapper.update();
        });

        expect(props.onRoleChange).toHaveBeenCalledWith("test");
    });

    it("changes a type", () => {
        const wrapper = mount(<DatastreamAgentsContentRow {...props} />);
        act(() => {
            wrapper.find(".agentTypeSelect select").simulate("change", { target: { value: "test" } });
            wrapper.update();
        });

        expect(props.onTypeChange).toHaveBeenCalledWith("test");
    });

    it("changes a name", () => {
        const wrapper = mount(<DatastreamAgentsContentRow {...props} />);
        act(() => {
            wrapper.find(".agentNameTextField input").simulate("change", { target: { value: "test" } });
            wrapper.update();
        });

        expect(props.onNameChange).toHaveBeenCalledWith("test");
    });

    it("displays the content notes", () => {
        mount(<DatastreamAgentsContentRow {...props} />);

        expect(mockDatastreamAgentsContentNotes).toHaveBeenCalledWith({
            expanded: false,
            notes: agent.notes,
            setNotes: expect.any(Function),
        });
    });
});
