import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import DatastreamAgentsModifyContentRow from "./DatastreamAgentsModifyContentRow";

let datastreamAgentsContentRowProps;
const mockDatastreamAgentsContentRow = jest.fn();
jest.mock("./DatastreamAgentsContentRow", () => (props) => {
    datastreamAgentsContentRowProps = props;
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

    it("proxies DatastreamAgentsContextRow", () => {
        const { asFragment } = render(<DatastreamAgentsModifyContentRow {...props} />);
        expect(asFragment()).toMatchSnapshot();
        expect(datastreamAgentsContentRowProps.agent).toEqual(props.agent);
    });
});
