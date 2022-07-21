import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
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
    beforeEach(() => {
        editorValues = {
            state: {
                isStateModalOpen: true,
                objectDetailsStorage: {},
            },
            action: {
            },
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
        const wrapper = shallow(<StateModal pid="foo:123" />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly when open", () => {
        const wrapper = shallow(<StateModal pid="foo:123" />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
