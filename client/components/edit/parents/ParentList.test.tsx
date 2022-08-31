import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import ParentList from "./ParentList";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
const mockUseFetchContext = jest.fn();
jest.mock("../../../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));

describe("ParentList", () => {
    let editorValues;
    let fetchValues;
    let pid: string;
    beforeEach(() => {
        pid = "foo:123";
        editorValues = {
            state: {
                parentDetailsStorage: {},
            },
            action: {
                clearPidFromChildListStorage: jest.fn(),
                loadParentDetailsIntoStorage: jest.fn(),
                removeFromObjectDetailsStorage: jest.fn(),
                removeFromParentDetailsStorage: jest.fn(),
                setSnackbarState: jest.fn(),
            },
        };
        fetchValues = {
            action: {
                fetchText: jest.fn(),
            }
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseFetchContext.mockReturnValue(fetchValues);
    });

    it("triggers a data load if necessary", () => {
        const wrapper = mount(<ParentList pid={pid} />);
        expect(editorValues.action.loadParentDetailsIntoStorage).toHaveBeenCalledWith(pid);
    });
});
