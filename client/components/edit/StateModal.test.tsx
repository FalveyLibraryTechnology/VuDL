import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { waitFor } from "@testing-library/react";
import toJson from "enzyme-to-json";
import StateModal from "./StateModal";

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
    let editorValues;
    let fetchContextValues;
    const pid = "foo:123";
    beforeEach(() => {
        editorValues = {
            state: {
                stateModalActivePid: pid,
                isStateModalOpen: true,
                objectDetailsStorage: {},
            },
            action: {},
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        fetchContextValues = {
            action: {
                fetchJSON: jest.fn(),
                fetchText: jest.fn(),
            },
        };
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
});
