import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { waitFor } from "@testing-library/react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import ObjectSummary from "./ObjectSummary";
import { FetchContextProvider } from "../../context/FetchContext";

describe("ObjectSummary", () => {
    let props;
    let lastRequestUrl;
    let apiResponse;

    beforeEach(() => {
        props = {
            pid: "foo:123",
        };
        apiResponse = {
            pid: "foo:123",
            sort: "title",
            metadata: [],
        };
        global.fetch = jest.fn((url) => {
            lastRequestUrl = url;
            return {
                ok: true,
                status: 200,
                json: async function () {
                    return apiResponse;
                },
            };
        });
    });

    it("renders defaults when no metadata is present", async () => {
        const wrapper = mount(
            <FetchContextProvider>
                <ObjectSummary {...props} />
            </FetchContextProvider>
        );
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/details");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders information from metadata when available", async () => {
        apiResponse.metadata = {
            "dc:title": ["My title"],
            "dc:description": ["<p>Hello <b>world</b>!</p>"],
        };
        const wrapper = mount(
            <FetchContextProvider>
                <ObjectSummary {...props} />
            </FetchContextProvider>
        );
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/details");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
