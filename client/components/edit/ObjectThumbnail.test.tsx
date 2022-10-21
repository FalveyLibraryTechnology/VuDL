import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import ObjectThumbnail from "./ObjectThumbnail";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

describe("ObjectThumbnail", () => {
    let editorValues;
    const pid = "foo";
    beforeEach(() => {
        editorValues = {
            state: {
                vufindUrl: "",
                objectDetailsStorage: {},
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("displays unavailable message when appropriate", async () => {
        const wrapper = mount(<ObjectThumbnail pid={pid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders thumbnail when available", async () => {
        editorValues.state.vufindUrl = "http://localhost";
        editorValues.state.objectDetailsStorage[pid] = { datastreams: ["THUMBNAIL"] };
        const wrapper = mount(<ObjectThumbnail pid={pid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
