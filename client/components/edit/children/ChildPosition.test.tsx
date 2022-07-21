import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import ChildPosition from "./ChildPosition";

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
});
