import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";import { ChildProps, Child } from "./Child";
import { EditorContextProvider, ObjectDetails } from "../../../context/EditorContext";
import { FetchContextProvider } from "../../../context/FetchContext";

jest.mock("./ChildList", () => () => "ChildList");
jest.mock("../ObjectButtonBar", () => () => "ObjectButtonBar");
jest.mock("../ObjectThumbnail", () => () => "ObjectThumbnail");

function getMountedChildComponent(props: ChildProps) {
    return mount(
        <FetchContextProvider>
            <EditorContextProvider>
                <Child {...props} />
            </EditorContextProvider>
        </FetchContextProvider>,
    );
}

describe("Child", () => {
    let pid: string;
    let props: ChildProps;
    let lastRequestUrl: string;
    let response: ObjectDetails;

    beforeEach(() => {
        pid = "foo:123";
        props = { pid, initialTitle: "initial title" };
        response = {
            fedoraDatastreams: [],
            metadata: {
                "dc:title": ["ajax-loaded title"],
            },
            models: [],
            pid,
            sortOn: "title",
        };
        global.fetch = jest.fn((url) => {
            lastRequestUrl = url as string;
            return {
                ok: true,
                status: 200,
                json: async function () {
                    return response;
                },
            };
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("renders using ajax-loaded data", async () => {
        const wrapper = getMountedChildComponent(props);
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/details");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders a thumbnail", async () => {
        props.thumbnail = true;
        const wrapper = getMountedChildComponent(props);
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/details");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("handles empty titles appropriately", async () => {
        props.initialTitle = "";
        response.metadata = {};
        const wrapper = getMountedChildComponent(props);
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/details");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("can be expanded to show children", async () => {
        // Suppress unexplained key error. TODO: identify cause
        jest.spyOn(console, "error").mockImplementation(jest.fn());
        await act(async () => {
            render(getMountedChildComponent(props));
            await waitFor(() => expect(global.fetch).toHaveBeenCalled());
        });
        // There should initially be an expand button and no children:
        const expandIcon = screen.getByRole("img", { name: "Expand Tree" });
        expect(screen.queryAllByText("ChildList")).toHaveLength(0);
        // Click expand:
        await act(async () => {
            await userEvent.setup().click(expandIcon);
            await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
        });
        // There should now be a collapse button and children:
        screen.getByRole("img", { name: "Collapse Tree" });
        expect(screen.queryAllByText("ChildList")).toHaveLength(1);
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/details");
    });
});
