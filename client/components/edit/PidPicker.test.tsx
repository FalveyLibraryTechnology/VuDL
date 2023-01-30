import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import PidPicker from "./PidPicker";
import { Parent } from "./PidPicker";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("./children/ChildList", () => () => "ChildList");

describe("PidPicker", () => {
    let callback: () => void;
    let editorValues;
    let favoritePidsCatalog: Record<string, string>;

    const getPicker = (selected = "", parents: Array<Parent> = []) => {
        return <PidPicker selected={selected} parents={parents} setSelected={callback} />;
    };

    beforeEach(() => {
        callback = jest.fn();
        favoritePidsCatalog = { "foo:123": "first test", "foo:124": "second test" };
        editorValues = {
            state: { favoritePidsCatalog },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("renders correctly with favorite PIDs", () => {
        const wrapper = shallow(getPicker());
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("sets selected PID when you click a favorite button", () => {
        const component = mount(getPicker());
        component.find("button").at(1).simulate("click");

        expect(callback).toHaveBeenCalledWith("foo:123");
        component.unmount();
    });

    it("sets selected PID when you use manual entry", () => {
        const component = mount(getPicker());
        component.find("input").simulate("change", { target: { value: "bar" } });
        component.find("button").at(0).simulate("click");

        expect(callback).toHaveBeenCalledWith("bar");
        component.unmount();
    });

    it("renders correctly with a selected PID", () => {
        const wrapper = shallow(getPicker("selected:123"));
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly with parents", () => {
        const parents = [
            { pid: "foo", title: "Foo" },
            { pid: "bar", title: "Bar" },
        ];
        const wrapper = shallow(getPicker("", parents));
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("allows you to clear a selected PID", () => {
        const component = mount(getPicker("selected:123"));
        component.find("button").simulate("click");

        expect(callback).toHaveBeenCalledWith("");
        component.unmount();
    });

    it("renders correctly without favorite PIDs", () => {
        editorValues.state.favoritePidsCatalog = [];
        const wrapper = shallow(getPicker());
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
