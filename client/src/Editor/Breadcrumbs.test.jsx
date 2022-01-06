import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { waitFor } from "@testing-library/react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import Breadcrumbs from "./Breadcrumbs";
import { FetchContextProvider } from "../FetchContext";
import { BrowserRouter } from "react-router-dom";

describe("Breadcrumb", () => {
    let props;
    let lastRequestUrl;
    let breadcrumbResponse = {};

    beforeEach(() => {
        props = { pid: "foo:1234" };
        global.fetch = jest.fn((url) => {
            lastRequestUrl = url;
            return {
                ok: true,
                status: 200,
                json: async function () {
                    return breadcrumbResponse;
                },
            };
        });
    });

    it("renders using ajax-loaded object data (simple case)", async () => {
        breadcrumbResponse = {
            pid: "foo:1234",
            title: "Fake Title",
            parents: [
                {
                    pid: "foo:1233",
                    title: "Fake Parent",
                    parents: [],
                },
            ],
        };

        const wrapper = mount(
            <BrowserRouter>
                <FetchContextProvider>
                    <Breadcrumbs {...props} />
                </FetchContextProvider>
            </BrowserRouter>
        );
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/breadcrumbs/foo:1234");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders using ajax-loaded object data (multiple parents with common grandparent)", async () => {
        breadcrumbResponse = {
            pid: "foo:1234",
            title: "Fake Title",
            parents: [
                {
                    pid: "foo:1233",
                    title: "Fake Parent 1",
                    parents: [
                        {
                            pid: "foo:1232",
                            title: "Fake Grandparent",
                            parents: [],
                        },
                    ],
                },
                {
                    pid: "foo:1231",
                    title: "Fake Parent 2",
                    parents: [
                        {
                            pid: "foo:1232",
                            title: "Fake Grandparent",
                            parents: [],
                        },
                    ],
                },
            ],
        };
        const wrapper = mount(
            <BrowserRouter>
                <FetchContextProvider>
                    <Breadcrumbs {...props} />
                </FetchContextProvider>
            </BrowserRouter>
        );
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/breadcrumbs/foo:1234");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
