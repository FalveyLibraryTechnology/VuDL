import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { mount, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import CreateObject from "./CreateObject";
import AjaxHelper from "../AjaxHelper";

jest.mock("../AjaxHelper");

let nodeSelectFunction = null;
jest.mock("@material-ui/lab", function () {
    return {
        TreeView: ({ onNodeSelect }) => {
            nodeSelectFunction = onNodeSelect;
            return "TreeView";
        },
        TreeItem: () => "TreeItem",
    };
});

describe("CreateObject", () => {
    let ajax;
    let props;

    beforeEach(() => {
        props = {
            parentPid: "",
            allowNoParentPid: false,
            allowChangeParentPid: true,
        };
        ajax = {
            apiUrl: "http://foo",
            getJobUrl: jest.fn(),
            getJSON: jest.fn(),
            getJSONPromise: jest.fn(() => new Promise(jest.fn(), jest.fn())),
            ajax: jest.fn(),
        };
        AjaxHelper.getInstance.mockReturnValue(ajax);
    });

    it("renders appropriately with default settings", () => {
        const wrapper = shallow(<CreateObject {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders appropriately with noParent and parent change enabled", () => {
        props.allowNoParentPid = true;
        const wrapper = shallow(<CreateObject {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders appropriately with editing disabled", () => {
        props.parentPid = "foo:1234";
        props.allowChangeParentPid = false;
        const wrapper = shallow(<CreateObject {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("disallows all empty pid settings", () => {
        props.allowChangeParentPid = false;
        expect(() => shallow(<CreateObject {...props} />)).toThrowError(
            "allowChangeParentPid and allowNoParentPid cannot both be false when parentPid is empty."
        );
    });

    it("disallows incompatible allowNoParentPid/allowChangeParentPid settings", () => {
        props.allowNoParentPid = true;
        props.allowChangeParentPid = false;
        expect(() => shallow(<CreateObject {...props} />)).toThrowError(
            "allowNoParentPid=true requires allowChangeParentPid to be true"
        );
    });

    it("submits appropriate data in default case", () => {
        const wrapper = mount(<CreateObject {...props} />);
        act(() => {
            nodeSelectFunction(new Event("event-foo"), "model-foo");
        });
        wrapper.find("input[name='title']").simulate("change", { target: { value: "Test Title" } });
        wrapper.find("input[name='parent']").simulate("change", { target: { value: "foo:1234" } });
        wrapper.find("form").simulate("submit");
        expect(ajax.ajax).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    model: "model-foo",
                    noParent: 0,
                    parent: "foo:1234",
                    state: "Inactive",
                    title: "Test Title",
                },
                dataType: "json",
                method: "post",
                url: "http://foo/edit/object/new",
            })
        );
    });

    it("submits appropriate data with no parent", () => {
        props.parentPid = "foo:1234";
        props.allowNoParentPid = true;
        const wrapper = mount(<CreateObject {...props} />);
        act(() => {
            nodeSelectFunction(new Event("event-foo"), "model-foo");
        });
        wrapper.find("input[name='title']").simulate("change", { target: { value: "Test Title" } });
        wrapper.find("input[name='noParent']").simulate("change", { target: { checked: true } });
        wrapper.find("form").simulate("submit");
        expect(ajax.ajax).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    model: "model-foo",
                    noParent: 1,
                    parent: "",
                    state: "Inactive",
                    title: "Test Title",
                },
                dataType: "json",
                method: "post",
                url: "http://foo/edit/object/new",
            })
        );
    });
});
