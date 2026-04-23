import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import ObjectModels from "./ObjectModels";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

describe("ObjectModels", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            state: {
                objectDetailsStorage: {},
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("renders models", async () => {
        editorValues.state.objectDetailsStorage["foo:123"] = {
            models: ["vudl-system:CoreModel", "vudl-system:CollectionModel", "vudl-system:FolderCollection"],
        };
        const { asFragment } = render(<ObjectModels pid="foo:123" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders nothing when data is missing", async () => {
        const { asFragment } = render(<ObjectModels pid="foo:123" />);
        expect(asFragment()).toMatchSnapshot();
    });
});
