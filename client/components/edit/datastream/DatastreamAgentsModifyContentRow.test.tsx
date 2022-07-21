import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import DatastreamAgentsModifyContentRow from "./DatastreamAgentsModifyContentRow";

const mockDatastreamAgentsContentRow = jest.fn();
jest.mock("./DatastreamAgentsContentRow", () => (props) => {
    mockDatastreamAgentsContentRow(props);
    return "DatastreamAgentsContentRow";
});
const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

describe("DatastreamAgentsModifyContentRow", () => {
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
            agent,
            index: 1,
            setHasChanges: jest.fn(),
        };
        editorValues = {
            state: { currentAgents: ["test1"] },
            action: { setCurrentAgents: jest.fn() },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamAgentsModifyContentRow {...props} />);

        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
