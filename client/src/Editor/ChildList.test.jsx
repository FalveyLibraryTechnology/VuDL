import React from "react";
import { describe, expect, it } from "@jest/globals";
import { waitFor } from "@testing-library/react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import ChildList from "./ChildList";
import { FetchContextProvider } from "../context";
import { BrowserRouter} from "react-router-dom";

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
                    return { docs: [ { id: "foo:124", title: "hello" } ] };
                },
            };
        })
    });

    it("renders using ajax-loaded root data", async () => {
        let wrapper;
        await waitFor(() => {
            wrapper = mount(
                <BrowserRouter>
                    <FetchContextProvider>
                        <ChildList {...props} />
                    </FetchContextProvider>
                </BrowserRouter>
            );
        });
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/children");
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders using ajax-loaded object data", async () => {
        props.pid = "foo:123";
        let wrapper;
        await waitFor(() => {
            wrapper = mount(
                <BrowserRouter>
                    <FetchContextProvider>
                        <ChildList {...props} />
                    </FetchContextProvider>
                </BrowserRouter>
            );
        });
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/children/foo:123");
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
