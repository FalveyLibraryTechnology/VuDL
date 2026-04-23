import { describe, expect, it } from "@jest/globals";
import { render, waitFor } from "@testing-library/react";
import EditHome from "./EditHome";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

jest.mock("./children/ChildList", () => () => "ChildList");
jest.mock("./EditorSnackbar", () => () => "EditorSnackbar");
jest.mock("./parents/ParentsModal", () => () => "ParentsModal");
jest.mock("./StateModal", () => () => "StateModal");
jest.mock("./Breadcrumbs", () => () => "Breadcrumbs");

describe("EditHome", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            action: {
                initializeCatalog: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });
    it("renders", async () => {
        const { asFragment } = render(<EditHome />);
        await waitFor(() => expect(editorValues.action.initializeCatalog).toHaveBeenCalled());
        expect(asFragment()).toMatchSnapshot();
    });
});
