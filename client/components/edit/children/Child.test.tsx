import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { waitFor } from "@testing-library/react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import { ChildProps, Child } from "./Child";
import { ChildListContextProvider } from "../../../context/ChildListContext";
import { FetchContextProvider } from "../../../context/FetchContext";

jest.mock("./ChildList", () => () => "ChildList");

function getMountedChildComponent(props: ChildListProps) {
    return mount(
        <FetchContextProvider>
            <ChildListContextProvider>
                <Child {...props} />
            </ChildListContextProvider>
        </FetchContextProvider>
    );
}

describe("Child", () => {
    let props: ChildProps;
    let lastRequestUrl: string;
    let response;

    beforeEach(() => {
        props = { pid: "foo:123", initialTitle: "initial title" };
        response = {
            fedoraDatastreams: [],
            metadata: {
                "dc:title": ["ajax-loaded title"],
            },
            models: [],
            pid: "foo:123",
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

    it("renders using ajax-loaded data", async () => {
        const wrapper = getMountedChildComponent(props);
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/details");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("can be expanded to show children", async () => {
        const wrapper = getMountedChildComponent(props);
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        const expandIcon = wrapper.find("svg title");
        expect(expandIcon.text()).toEqual("Expand Tree");
        expandIcon.simulate("click");
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/details");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
