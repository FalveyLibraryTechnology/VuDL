import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import ChildPosition from "./ChildPosition";
import TextField from "@mui/material/TextField";

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

describe("ChildPosition", () => {
    let editorValues;
    let fetchContextValues;
    const pid = "foo:123";
    const parentPid = "foo:122";
    beforeEach(() => {
        editorValues = {
            state: {
                objectDetailsStorage: {},
            },
            action: {
                clearPidFromChildListStorage: jest.fn(),
                removeFromObjectDetailsStorage: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        fetchContextValues = {
            action: {
                fetchText: jest.fn(),
            },
        };
        mockUseFetchContext.mockReturnValue(fetchContextValues);
    });

    it("renders correctly when no sort or sequence exists", () => {
        editorValues.state.objectDetailsStorage[pid] = { pid };
        editorValues.state.objectDetailsStorage[parentPid] = { pid: parentPid };
        const wrapper = shallow(<ChildPosition pid={pid} parentPid={parentPid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly when a sequence exists and parent is not custom sorted", () => {
        const sequences = [`${parentPid}#73`];
        editorValues.state.objectDetailsStorage[pid] = { pid, sequences };
        editorValues.state.objectDetailsStorage[parentPid] = { pid: parentPid, sortOn: "title" };
        const wrapper = shallow(<ChildPosition pid={pid} parentPid={parentPid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly when a sequence exists and parent is custom sorted", () => {
        const sequences = [`${parentPid}#73`];
        editorValues.state.objectDetailsStorage[pid] = { pid, sequences };
        editorValues.state.objectDetailsStorage[parentPid] = { pid: parentPid, sortOn: "custom" };
        const wrapper = shallow(<ChildPosition pid={pid} parentPid={parentPid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("saves changes when the input is changed", async () => {
        const sequences = [`${parentPid}#73`];
        editorValues.state.objectDetailsStorage[pid] = { pid, sequences };
        editorValues.state.objectDetailsStorage[parentPid] = { pid: parentPid, sortOn: "custom" };
        fetchContextValues.action.fetchText.mockResolvedValue("ok");
        const wrapper = mount(<ChildPosition pid={pid} parentPid={parentPid} />);
        await act(async () => {
            wrapper
                .find(TextField)
                .find("input")
                .at(0)
                .simulate("blur", { target: { value: "66" } });
        });
        await Promise.resolve();
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/object/foo%3A123/positionInParent/foo%3A122",
            { body: 66, method: "PUT" }
        );
        expect(editorValues.action.clearPidFromChildListStorage).toHaveBeenCalledWith(parentPid);
        expect(editorValues.action.removeFromObjectDetailsStorage).toHaveBeenCalledWith(pid);
    });

    it("doesn't save changes when the input is unchanged", async () => {
        const sequences = [`${parentPid}#73`];
        editorValues.state.objectDetailsStorage[pid] = { pid, sequences };
        editorValues.state.objectDetailsStorage[parentPid] = { pid: parentPid, sortOn: "custom" };
        const wrapper = mount(<ChildPosition pid={pid} parentPid={parentPid} />);
        await act(async () => {
            wrapper
                .find(TextField)
                .find("input")
                .at(0)
                .simulate("blur", { target: { value: "73" } });
        });
        await Promise.resolve();
        expect(fetchContextValues.action.fetchText).not.toHaveBeenCalled();
        expect(editorValues.action.clearPidFromChildListStorage).not.toHaveBeenCalled();
        expect(editorValues.action.removeFromObjectDetailsStorage).not.toHaveBeenCalled();
    });
});
