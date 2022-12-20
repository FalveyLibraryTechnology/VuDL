import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { waitFor } from "@testing-library/react";
import { mount, render } from "enzyme";
import toJson from "enzyme-to-json";
import CreateObject from "./CreateObject";
import { FetchContextProvider } from "../../../context/FetchContext";

let nodeSelectFunction = null;
let treeItems = null;

jest.mock("@mui/lab/TreeItem", function () {
    return () => "TreeItem";
});

jest.mock("@mui/lab/TreeView", function () {
    return ({ onNodeSelect, children }) => {
        nodeSelectFunction = onNodeSelect;
        treeItems = children;
        return children;
    };
});

describe("CreateObject", () => {
    let props;
    let submittedData;

    beforeEach(() => {
        props = {
            parentPid: "",
            allowNoParentPid: false,
            allowChangeParentPid: true,
        };
        submittedData = null;
        global.fetch = jest.fn((url, data) => {
            if (url == "http://localhost:9000/api/edit/models") {
                // If models were requested, set up fake data:
                const setFakeModels = function (callback) {
                    callback(["model-foo", "model-bar", "model-baz"]);
                };
                return {
                    ok: true,
                    status: 200,
                    json: () => new Promise(setFakeModels, jest.fn()),
                };
            } else if (url == "http://localhost:9000/api/edit/object/new") {
                // If the form was submitted, save the data so we can make assertions about it:
                submittedData = data;
                return {
                    ok: true,
                    status: 200,
                    text: async () => "ok",
                };
            }
        });
    });

    function getCreateObjectToTest(props) {
        return (
            <FetchContextProvider>
                <CreateObject {...props} />
            </FetchContextProvider>
        );
    }

    it("renders appropriately with default settings", async () => {
        const wrapper = render(getCreateObjectToTest({}));
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
        await act(async () => {
            await waitFor(() => {
                wrapper.find("form").simulate("submit");
            });
            wrapper.update();
        });
        expect(treeItems.length).toEqual(3); // make sure setFakeModels is working
        expect(submittedData).toEqual({
            body: JSON.stringify({
                title: "Test Title",
                parent: "foo:1234",
                model: "model-foo",
                state: "Inactive",
            }),
            credentials: "include",
            headers: {
                Authorization: "Token null",
                "Content-Type": "application/json",
            },
            method: "POST",
            mode: "cors",
        });
        expect(wrapper.text()).toContain("Object created:");
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
        await act(async () => {
            await waitFor(() => {
                wrapper.find("form").simulate("submit");
            });
        });
        expect(treeItems.length).toEqual(3); // make sure setFakeModels is working
        expect(submittedData).toEqual({
            body: JSON.stringify({
                title: "Test Title",
                parent: "foo:1234",
                model: "model-foo",
                state: "Inactive",
            }),
            credentials: "include",
            headers: {
                Authorization: "Token null",
                "Content-Type": "application/json",
            },
            method: "POST",
            mode: "cors",
        });
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
        await act(async () => {
            await waitFor(() => {
                wrapper.find("form").simulate("submit");
            });
        });
        expect(submittedData).toEqual({
            body: JSON.stringify({
                title: "Test Title",
                parent: "",
                model: "model-foo",
                state: "Active",
            }),
            credentials: "include",
            headers: {
                Authorization: "Token null",
                "Content-Type": "application/json",
            },
            method: "POST",
            mode: "cors",
        });
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
        await act(async () => {
            await waitFor(() => {
                wrapper.find("form").simulate("submit");
            });
        });
        expect(submittedData).toEqual({
            body: JSON.stringify({
                title: "Test Title",
                parent: "",
                model: "model-foo",
                state: "Active",
            }),
            credentials: "include",
            headers: {
                Authorization: "Token null",
                "Content-Type": "application/json",
            },
            method: "POST",
            mode: "cors",
        });
    });
});
