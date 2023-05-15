import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import * as EditorContextModule from "../../context/EditorContext";
import ObjectPreviewButton from "./ObjectPreviewButton";

describe("ObjectPreviewButton", () => {
    let pid: string;
    let mockContext;

    beforeEach(() => {
        pid = "foo:123";
        mockContext = {
            state: { vufindUrl: "" },
        };
        jest.spyOn(EditorContextModule, "useEditorContext").mockReturnValue(mockContext);
    });

    it("renders correctly without VuFind URL", async () => {
        const wrapper = mount(<ObjectPreviewButton pid={pid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly with VuFind URL", async () => {
        mockContext.state.vufindUrl = "http://localhost";
        const wrapper = mount(<ObjectPreviewButton pid={pid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("can open a VuFind preview URL", async () => {
        mockContext.state.vufindUrl = "http://localhost";
        const wrapper = mount(<ObjectPreviewButton pid={pid} />);
        const previewButton = wrapper.find("button");
        expect(previewButton.text()).toEqual("Preview");
        const openSpy = jest.spyOn(window, "open").mockImplementation(jest.fn());
        previewButton.simulate("click");
        expect(openSpy).toHaveBeenCalledWith("http://localhost/Item/" + pid);
    });
});
