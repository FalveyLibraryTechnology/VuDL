import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { waitFor } from "@testing-library/react";
import toJson from "enzyme-to-json";
import StateModal from "./StateModal";
import Checkbox from "@mui/material/Checkbox";
import RadioGroup from "@mui/material/RadioGroup";

const mockUseGlobalContext = jest.fn();
jest.mock("../../context/GlobalContext", () => ({
    useGlobalContext: () => {
        return mockUseGlobalContext();
    },
}));

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

const mockUseFetchContext = jest.fn();
jest.mock("../../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));

describe("StateModal", () => {
    let globalValues;
    let editorValues;
    let fetchContextValues;
    const pid = "foo:123";
    beforeEach(() => {
        globalValues = {
            action: {
                setSnackbarState: jest.fn(),
            },
        };
        editorValues = {
            state: {
                stateModalActivePid: pid,
                isStateModalOpen: true,
                objectDetailsStorage: {},
            },
            action: {
                removeFromObjectDetailsStorage: jest.fn(),
                toggleStateModal: jest.fn(),
            },
        };
        fetchContextValues = {
            action: {
                fetchJSON: jest.fn(),
                fetchText: jest.fn(),
            },
        };
        mockUseGlobalContext.mockReturnValue(globalValues);
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseFetchContext.mockReturnValue(fetchContextValues);
    });

    it("renders correctly when closed", () => {
        editorValues.state.isStateModalOpen = false;
        const wrapper = shallow(<StateModal />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly for a pending object", () => {
        const wrapper = shallow(<StateModal />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly for a loaded object with children", async () => {
        editorValues.state.objectDetailsStorage[pid] = { pid, state: "Active" };
        fetchContextValues.action.fetchJSON.mockResolvedValue({ numFound: 100 });
        let wrapper;
        await act(async () => {
            wrapper = mount(<StateModal />);
        });
        await waitFor(() => expect(fetchContextValues.action.fetchJSON).toHaveBeenCalled());
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly for a loaded object without children", async () => {
        editorValues.state.objectDetailsStorage[pid] = { pid, state: "Active" };
        fetchContextValues.action.fetchJSON.mockResolvedValue({ numFound: 0 });
        let wrapper;
        await act(async () => {
            wrapper = mount(<StateModal />);
        });
        await waitFor(() => expect(fetchContextValues.action.fetchJSON).toHaveBeenCalled());
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("saves data correctly", async () => {
        editorValues.state.objectDetailsStorage[pid] = { pid, state: "Inactive" };
        fetchContextValues.action.fetchJSON.mockResolvedValue({ numFound: 0 });
        fetchContextValues.action.fetchText.mockResolvedValue("ok");
        let wrapper;
        await act(async () => {
            wrapper = mount(<StateModal />);
        });
        await waitFor(() => expect(fetchContextValues.action.fetchJSON).toHaveBeenCalled());
        wrapper.update();
        await act(async () => {
            wrapper
                .find(RadioGroup)
                .props()
                .onChange({ target: { value: "Active" } });
        });
        await act(async () => {
            wrapper.find("button").at(1).simulate("click");
        });
        await waitFor(() =>
            expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
                "http://localhost:9000/api/edit/object/foo%3A123/state",
                { body: "Active", method: "PUT" }
            )
        );
        expect(globalValues.action.setSnackbarState).toHaveBeenCalledWith({
            message: "Status saved successfully.",
            open: true,
            severity: "success",
        });
        expect(editorValues.action.removeFromObjectDetailsStorage).toHaveBeenCalledWith(pid);
        expect(editorValues.action.toggleStateModal).toHaveBeenCalled();
    });

    it("does not save when nothing changes", async () => {
        editorValues.state.objectDetailsStorage[pid] = { pid, state: "Inactive" };
        fetchContextValues.action.fetchJSON.mockResolvedValue({ numFound: 0 });
        fetchContextValues.action.fetchText.mockResolvedValue("ok");
        let wrapper;
        await act(async () => {
            wrapper = mount(<StateModal />);
        });
        await waitFor(() => expect(fetchContextValues.action.fetchJSON).toHaveBeenCalled());
        wrapper.update();
        await act(async () => {
            wrapper.find("button").at(1).simulate("click");
        });
        await waitFor(() =>
            expect(globalValues.action.setSnackbarState).toHaveBeenCalledWith({
                message: "No changes were made.",
                open: true,
                severity: "info",
            })
        );
        expect(fetchContextValues.action.fetchText).not.toHaveBeenCalled();
        expect(editorValues.action.removeFromObjectDetailsStorage).not.toHaveBeenCalled();
        expect(editorValues.action.toggleStateModal).not.toHaveBeenCalled();
    });

    it("handles save failure gracefully", async () => {
        editorValues.state.objectDetailsStorage[pid] = { pid, state: "Inactive" };
        fetchContextValues.action.fetchJSON.mockResolvedValue({ numFound: 0 });
        fetchContextValues.action.fetchText.mockResolvedValue("not ok");
        let wrapper;
        await act(async () => {
            wrapper = mount(<StateModal />);
        });
        await waitFor(() => expect(fetchContextValues.action.fetchJSON).toHaveBeenCalled());
        wrapper.update();
        await act(async () => {
            wrapper
                .find(RadioGroup)
                .props()
                .onChange({ target: { value: "Active" } });
        });
        await act(async () => {
            wrapper.find("button").at(1).simulate("click");
        });
        await waitFor(() =>
            expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
                "http://localhost:9000/api/edit/object/foo%3A123/state",
                { body: "Active", method: "PUT" }
            )
        );
        expect(globalValues.action.setSnackbarState).toHaveBeenCalledWith({
            message: 'Status failed to save; "not ok"',
            open: true,
            severity: "error",
        });
        expect(editorValues.action.removeFromObjectDetailsStorage).not.toHaveBeenCalled();
        expect(editorValues.action.toggleStateModal).toHaveBeenCalled();
    });

    it("handles child save failure gracefully", async () => {
        editorValues.state.objectDetailsStorage[pid] = { pid, state: "Inactive" };
        fetchContextValues.action.fetchJSON.mockResolvedValue({ numFound: 1, docs: [{ id: "foo:125" }] });
        fetchContextValues.action.fetchText.mockResolvedValue("not ok");
        let wrapper;
        await act(async () => {
            wrapper = mount(<StateModal />);
        });
        await waitFor(() => expect(fetchContextValues.action.fetchJSON).toHaveBeenCalled());
        wrapper.update();
        await act(async () => {
            wrapper
                .find(RadioGroup)
                .props()
                .onChange({ target: { value: "Active" } });
        });
        await act(async () => {
            wrapper
                .find(Checkbox)
                .props()
                .onChange({ target: { checked: true } });
        });
        await act(async () => {
            wrapper.find("button").at(1).simulate("click");
        });
        await waitFor(() =>
            expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
                "http://localhost:9000/api/edit/object/foo%3A125/state",
                { body: "Active", method: "PUT" }
            )
        );
        expect(globalValues.action.setSnackbarState).toHaveBeenCalledWith({
            message: 'Status failed to save; "not ok"',
            open: true,
            severity: "error",
        });
        expect(editorValues.action.removeFromObjectDetailsStorage).not.toHaveBeenCalled();
        expect(editorValues.action.toggleStateModal).toHaveBeenCalled();
    });

    it("updates children correctly", async () => {
        editorValues.state.objectDetailsStorage[pid] = { pid, state: "Inactive" };
        fetchContextValues.action.fetchJSON.mockResolvedValue({ numFound: 1, docs: [{ id: "foo:125" }] });
        fetchContextValues.action.fetchText.mockResolvedValue("ok");
        let wrapper;
        await act(async () => {
            wrapper = mount(<StateModal />);
        });
        await waitFor(() => expect(fetchContextValues.action.fetchJSON).toHaveBeenCalled());
        wrapper.update();
        await act(async () => {
            wrapper
                .find(RadioGroup)
                .props()
                .onChange({ target: { value: "Active" } });
        });
        await act(async () => {
            wrapper
                .find(Checkbox)
                .props()
                .onChange({ target: { checked: true } });
        });
        await act(async () => {
            wrapper.find("button").at(1).simulate("click");
        });
        await waitFor(() =>
            expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
                "http://localhost:9000/api/edit/object/foo%3A123/state",
                { body: "Active", method: "PUT" }
            )
        );
        expect(globalValues.action.setSnackbarState).toHaveBeenCalledWith({
            message: "Status saved successfully.",
            open: true,
            severity: "success",
        });
        expect(fetchContextValues.action.fetchText).toHaveBeenNthCalledWith(
            1,
            "http://localhost:9000/api/edit/object/foo%3A125/state",
            { body: "Active", method: "PUT" }
        );
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledTimes(2);
        expect(editorValues.action.removeFromObjectDetailsStorage).toHaveBeenNthCalledWith(1, "foo:125");
        expect(editorValues.action.removeFromObjectDetailsStorage).toHaveBeenNthCalledWith(2, pid);
        expect(editorValues.action.toggleStateModal).toHaveBeenCalled();
    });
});
