import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import ObjectLoader from "./ObjectLoader";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

describe("ObjectLoader", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            state: {
                objectDetailsStorage: {},
            },
            action: {
                loadObjectDetailsIntoStorage: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });
    it("renders correctly for a pending object", () => {
        const { asFragment } = render(<ObjectLoader pid="foo:123" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly for a loaded object", () => {
        editorValues.state.objectDetailsStorage["foo:123"] = { foo: "bar" };
        const { asFragment } = render(<ObjectLoader pid="foo:123" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("loads the object as needed when optional callback is omitted", () => {
        render(<ObjectLoader pid="foo:123" />);
        expect(editorValues.action.loadObjectDetailsIntoStorage).toHaveBeenCalledWith("foo:123", null);
    });

    it("loads the object as needed when optional callback is provided", () => {
        const callback = jest.fn();
        render(<ObjectLoader pid="foo:123" errorCallback={callback} />);
        expect(editorValues.action.loadObjectDetailsIntoStorage).toHaveBeenCalledWith("foo:123", callback);
    });
});
