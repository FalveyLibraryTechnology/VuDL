import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import ObjectEditor from "./ObjectEditor";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("./children/ChildList", () => () => "ChildList");
jest.mock("./Breadcrumbs", () => () => "Breadcrumbs");
jest.mock("./datastream/DatastreamList", () => () => "DatastreamList");
jest.mock("./datastream/DatastreamModal", () => () => "DatastreamModal");
jest.mock("./ObjectSummary", () => () => "ObjectSummary");
jest.mock("./EditorSnackbar", () => () => "EditorSnackbar");
jest.mock("./parents/ParentsModal", () => () => "ParentsModal");
jest.mock("./StateModal", () => () => "StateModal");

describe("ObjectEditor", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            action: {
                initializeCatalog: jest.fn(),
                setCurrentPid: jest.fn(),
                loadCurrentObjectDetails: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });
    it("renders", () => {
        const { asFragment } = render(<ObjectEditor pid="foo:123" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("calls initializeCatalog", () => {
        render(<ObjectEditor pid="foo:123" />);
        expect(editorValues.action.initializeCatalog).toHaveBeenCalled();
        expect(editorValues.action.setCurrentPid).toHaveBeenCalledWith("foo:123");
        expect(editorValues.action.loadCurrentObjectDetails).toHaveBeenCalled();
    });
});
