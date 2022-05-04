import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import ObjectSummary from "./ObjectSummary";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

describe("ObjectSummary", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            state: {
                currentPid: "foo:123",
                loading: false,
            },
            action: {
                extractFirstMetadataValue: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("displays loading message when appropriate", async () => {
        editorValues.state.loading = true;
        jest.spyOn(editorValues.action, "extractFirstMetadataValue").mockReturnValue("");
        const wrapper = mount(<ObjectSummary />);
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders information from metadata when available", async () => {
        const metaSpy = jest
            .spyOn(editorValues.action, "extractFirstMetadataValue")
            .mockReturnValueOnce("My title")
            .mockReturnValueOnce("<p>Hello <b>world</b>!</p>");
        const wrapper = mount(<ObjectSummary />);
        wrapper.update();
        expect(metaSpy).toHaveBeenCalledTimes(2);
        expect(metaSpy).toHaveBeenNthCalledWith(1, "dc:title", "Title not available");
        expect(metaSpy).toHaveBeenNthCalledWith(2, "dc:description", "");
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
