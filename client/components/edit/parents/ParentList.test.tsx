import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import ParentList from "./ParentList";
import { waitFor } from "@testing-library/dom";

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
                parentDetailsStorage: {
                    "foo:123": {
                        parents: [
                            {
                                pid: "foo:122",
                                title: "Parent",
                                parents: [
                                    {
                                        pid: "foo:121",
                                        title: "Grandparent",
                                        parents: [
                                            {
                                                pid: "foo:120",
                                                title: "Great-grandparent",
                                                parents: [],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                },
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
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseFetchContext.mockReturnValue(fetchValues);
    });

    it("triggers a data load if necessary", () => {
        editorValues.state.parentDetailsStorage = {};
        mount(<ParentList pid={pid} />);
        expect(editorValues.action.loadParentDetailsIntoStorage).toHaveBeenCalledWith(pid);
    });

    it("renders an empty list correctly", () => {
        editorValues.state.parentDetailsStorage = {
            "foo:123": {
                parents: [],
            },
        };
        const wrapper = shallow(<ParentList pid={pid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders a populated parent list correctly", () => {
        const wrapper = shallow(<ParentList pid={pid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("deletes parents on button click", async () => {
        const confirmSpy = jest.spyOn(window, "confirm").mockResolvedValue(true);
        fetchValues.action.fetchText.mockResolvedValue("ok");
        const wrapper = mount(<ParentList pid={pid} />);
        wrapper.find("button").simulate("click");
        expect(confirmSpy).toHaveBeenCalledWith("Are you sure you wish to remove this parent?");
        expect(fetchValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/object/foo%3A123/parent/foo%3A122",
            { method: "DELETE" }
        );
        await waitFor(() => expect(editorValues.action.removeFromObjectDetailsStorage).toHaveBeenCalled());
        expect(editorValues.action.removeFromObjectDetailsStorage).toHaveBeenCalledWith(pid);
        expect(editorValues.action.removeFromParentDetailsStorage).toHaveBeenCalledWith(pid);
        expect(editorValues.action.clearPidFromChildListStorage).toHaveBeenCalledWith("foo:122");
        expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith({
            message: "Successfully removed foo:123 from foo:122",
            open: true,
            severity: "info",
        });
    });
});
