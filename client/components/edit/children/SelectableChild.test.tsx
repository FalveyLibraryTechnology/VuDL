import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import { SelectableChildProps, SelectableChild } from "./SelectableChild";

jest.mock("./ChildList", () => () => "ChildList");
jest.mock("../ObjectThumbnail", () => () => "ObjectThumbnail");
const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

describe("SelectableChild", () => {
    let editorValues;
    let props: SelectableChildProps;

    beforeEach(() => {
        props = { pid: "foo:123", initialTitle: "initial title", selectCallback: jest.fn() };
        editorValues = {
            state: { objectDetailsStorage: {} },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("renders using provided default data", async () => {
        const wrapper = shallow(<SelectableChild {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders thumbnails", async () => {
        props.thumbnail = true;
        const wrapper = shallow(<SelectableChild {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders using object details storage data", async () => {
        editorValues.state.objectDetailsStorage["foo:123"] = { metadata: { "dc:title": ["loaded title"] } };
        const wrapper = shallow(<SelectableChild {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("handles missing object details storage title metadata correctly", async () => {
        editorValues.state.objectDetailsStorage["foo:123"] = { metadata: {} };
        const wrapper = shallow(<SelectableChild {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("handles empty initial titles appropriately", async () => {
        props.initialTitle = "";
        const wrapper = shallow(<SelectableChild {...props} />);
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("allows pids to be selected", async () => {
        const wrapper = mount(<SelectableChild {...props} />);
        wrapper.find("button").simulate("click");
        expect(props.selectCallback).toHaveBeenCalledWith("foo:123");
    });

    it("can be expanded to show children", async () => {
        const wrapper = mount(<SelectableChild {...props} />);
        const expandIcon = wrapper.find("svg title");
        expect(expandIcon.text()).toEqual("Expand Tree");
        expandIcon.simulate("click");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
