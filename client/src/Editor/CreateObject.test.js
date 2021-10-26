import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { waitFor } from "@testing-library/react";
import { mount, render } from "enzyme";
import toJson from "enzyme-to-json";
import CreateObject from "./CreateObject";
import { FetchContextProvider, useFetchContext } from "../context";

let nodeSelectFunction = null;
let treeItems = null;
jest.mock("@material-ui/lab", function () {
    return {
        TreeView: ({ onNodeSelect, children }) => {
            nodeSelectFunction = onNodeSelect;
            treeItems = children;
            return children;
        },
        TreeItem: () => "TreeItem",
    };
});

function setFakeModels(callback) {
    callback(["model-foo", "model-bar", "model-baz"]);
}

describe("CreateObject", () => {
    let ajax;
    let props;

    beforeEach(() => {
        props = {
            parentPid: "",
            allowNoParentPid: false,
            allowChangeParentPid: true,
        };
        ajax = {};
        useFetchContext.fetchJSON = jest.fn(() => new Promise(setFakeModels, jest.fn()));
        useFetchContext.makeRequest = jest.fn();
    });

    function getCreateObjectToTest(props) {
        return <FetchContextProvider><CreateObject {...props} /></FetchContextProvider>;
    }

    it("renders appropriately with default settings", async () => {
        const wrapper = render(getCreateObjectToTest(props));
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders appropriately with noParent and parent change enabled", () => {
        props.allowNoParentPid = true;
        const wrapper = render(getCreateObjectToTest(props));
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders appropriately with editing disabled", () => {
        props.parentPid = "foo:1234";
        props.allowChangeParentPid = false;
        const wrapper = render(getCreateObjectToTest(props));
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("disallows all empty pid settings", () => {
        props.allowChangeParentPid = false;
        expect(() => render(getCreateObjectToTest(props))).toThrowError(
            "allowChangeParentPid and allowNoParentPid cannot both be false when parentPid is empty."
        );
    });

    it("disallows incompatible allowNoParentPid/allowChangeParentPid settings", () => {
        props.allowNoParentPid = true;
        props.allowChangeParentPid = false;
        props.parentPid = "foo:pid";
        expect(() => render(getCreateObjectToTest(props))).toThrowError(
            "allowNoParentPid=true requires allowChangeParentPid to be true when parentPid is non-empty."
        );
    });

    it("submits appropriate data in default case", async () => {
        let wrapper;
        await waitFor(() => {
            wrapper = mount(getCreateObjectToTest(props));
        });
        act(() => {
            nodeSelectFunction(new Event("event-foo"), "model-foo");
            // Test that category select has no effect:
            nodeSelectFunction(new Event("event-foo"), "__categoryWillBeIgnored");
        });
        wrapper.find("input[name='title']").simulate("change", { target: { value: "Test Title" } });
        wrapper.find("input[name='parent']").simulate("change", { target: { value: "foo:1234" } });
        wrapper.find("form").simulate("submit");
        expect(treeItems.length).toEqual(3); // make sure setFakeModels is working
        expect(useFetchContext.makeRequest).toHaveBeenCalledWith(
            "http://foo/edit/object/new",
            expect.objectContaining({
                method: "POST",
                data: JSON.stringify({
                    model: "model-foo",
                    parent: "foo:1234",
                    state: "Inactive",
                    title: "Test Title",
                }),
            }),
            { "Content-Type": "application/json" }
        );
    });

    it("pre-fills parent pid using parentPid property", async () => {
        props.parentPid = "foo:1234";
        props.allowChangeParentPid = false;
        let wrapper;
        await waitFor(() => {
            wrapper = mount(getCreateObjectToTest(props));
        });
        act(() => {
            nodeSelectFunction(new Event("event-foo"), "model-foo");
        });
        wrapper.find("input[name='title']").simulate("change", { target: { value: "Test Title" } });
        wrapper.find("form").simulate("submit");
        expect(treeItems.length).toEqual(3); // make sure setFakeModels is working
        expect(useFetchContext.makeRequest).toHaveBeenCalledWith(
            "http://foo/edit/object/new",
            expect.objectContaining({
                method: "POST",
                data: JSON.stringify({
                    model: "model-foo",
                    parent: "foo:1234",
                    state: "Inactive",
                    title: "Test Title",
                }),
            }),
            { "Content-Type": "application/json" }
        );
    });

    it("submits appropriate data with active state and no parent", async () => {
        props.parentPid = "foo:1234";
        props.allowNoParentPid = true;
        let wrapper;
        await waitFor(() => {
            wrapper = mount(getCreateObjectToTest(props));
        });
        act(() => {
            nodeSelectFunction(new Event("event-foo"), "model-foo");
        });
        wrapper.find("input[name='title']").simulate("change", { target: { value: "Test Title" } });
        wrapper.find("input[name='state'][value='Active']").simulate("change", { target: { value: "Active" } });
        wrapper.find("input[name='noParent']").simulate("change", { target: { checked: true } });
        wrapper.find("form").simulate("submit");
        expect(useFetchContext.makeRequest).toHaveBeenCalledWith(
            "http://foo/edit/object/new",
            expect.objectContaining({
                method: "POST",
                data: JSON.stringify({
                    model: "model-foo",
                    parent: "",
                    state: "Active",
                    title: "Test Title",
                }),
            }),
            { "Content-Type": "application/json" }
        );
    });

    it("checks no parent when parent pid is cleared", async () => {
        props.parentPid = "foo:1234";
        props.allowNoParentPid = true;
        let wrapper;
        await waitFor(() => {
            wrapper = mount(getCreateObjectToTest(props));
        });
        act(() => {
            nodeSelectFunction(new Event("event-foo"), "model-foo");
        });
        wrapper.find("input[name='title']").simulate("change", { target: { value: "Test Title" } });
        wrapper.find("input[name='state'][value='Active']").simulate("change", { target: { value: "Active" } });
        wrapper.find("input[name='parent']").simulate("change", { target: { value: "" } });
        wrapper.find("form").simulate("submit");
        expect(useFetchContext.makeRequest).toHaveBeenCalledWith(
            "http://foo/edit/object/new",
            expect.objectContaining({
                method: "POST",
                data: JSON.stringify({
                    model: "model-foo",
                    parent: "",
                    state: "Active",
                    title: "Test Title",
                }),
            }),
            { "Content-Type": "application/json" }
        );
    });
});
