import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamDeleteModalContent from "./DatastreamDeleteModalContent";

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
describe("DatastreamDeleteModalContent", () => {
    let fetchValues;
    let editorValues;
    beforeEach(() => {
        fetchValues = {
            action: {
                fetchText: jest.fn(),
            },
        };
        editorValues = {
            state: {
                currentPid: "vudl:123",
                activeDatastream: "THUMBNAIL",
            },
            action: {
                getCurrentModelsDatastreams: jest.fn().mockResolvedValue({}),
                setSnackbarState: jest.fn(),
                toggleDatastreamModal: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseFetchContext.mockReturnValue(fetchValues);
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamDeleteModalContent />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("deletes with success", async () => {
        fetchValues.action.fetchText.mockResolvedValue("Delete success!");
        const wrapper = mount(<DatastreamDeleteModalContent />);
        await act(async () => {
            wrapper.find("button.yesButton").simulate("click");
            wrapper.update();
        });

        expect(fetchValues.action.fetchText).toHaveBeenCalledWith(
            expect.stringContaining(editorValues.state.currentPid),
            expect.objectContaining({
                method: "DELETE",
            })
        );
        expect(editorValues.action.getCurrentModelsDatastreams).toHaveBeenCalled();
        expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith(
            expect.objectContaining({
                open: true,
                message: "Delete success!",
                severity: "success",
            })
        );
    });

    it("deletes with failure ", async () => {
        fetchValues.action.fetchText.mockRejectedValue(new Error("Delete failure!"));
        const wrapper = mount(<DatastreamDeleteModalContent />);
        await act(async () => {
            wrapper.find("button.yesButton").simulate("click");
            wrapper.update();
        });

        expect(fetchValues.action.fetchText).toHaveBeenCalledWith(
            expect.stringContaining(editorValues.state.currentPid),
            expect.objectContaining({
                method: "DELETE",
            })
        );

        expect(editorValues.action.setSnackbarState).toHaveBeenCalledWith(
            expect.objectContaining({
                open: true,
                message: "Delete failure!",
                severity: "error",
            })
        );
    });
});
