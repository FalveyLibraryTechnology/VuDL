import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { waitFor } from "@testing-library/react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import ChildList from "./ChildList";
import { FetchContextProvider } from "../../context/FetchContext";

describe("ChildList", () => {
    let props;
    let lastRequestUrl;

    beforeEach(() => {
        props = {};
        global.fetch = jest.fn((url) => {
            lastRequestUrl = url;
            return {
                ok: true,
                status: 200,
                json: async function () {
                    return { docs: [{ id: "foo:124", title: "hello" }] };
                },
            };
        });
    });

    it("renders using ajax-loaded root data", async () => {
        const wrapper = mount(
            <FetchContextProvider>
                <ChildList {...props} />
            </FetchContextProvider>
        );
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/children/");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders using ajax-loaded object data", async () => {
        props.pid = "foo:123";
        const wrapper = mount(
            <FetchContextProvider>
                <ChildList {...props} />
            </FetchContextProvider>
        );
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/children/foo:123");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
