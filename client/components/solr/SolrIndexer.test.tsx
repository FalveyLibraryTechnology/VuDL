import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import SolrIndexer from "./SolrIndexer";

const mockUseFetchContext = jest.fn();
jest.mock("../../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));

describe("SolrIndexer", () => {
    let fetchContextValues;
    beforeEach(() => {
        fetchContextValues = {
            action: {
                fetchText: jest.fn(),
            },
        };
        mockUseFetchContext.mockReturnValue(fetchContextValues);
    });

    it("renders", () => {
        const wrapper = mount(<SolrIndexer />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("changes the pid input", () => {
        const wrapper = mount(<SolrIndexer />);
        wrapper.find("#solrIndexPid").simulate("change", {
            target: {
                value: "testPid",
            },
        });
        expect(wrapper.find("#solrIndexPid").instance().value).toEqual("testPid");
    });

    it("fetches the preview text", async () => {
        fetchContextValues.action.fetchText.mockResolvedValue("testText");

        const wrapper = mount(<SolrIndexer />);
        await act(async () => {
            wrapper.find("#solrIndexPid").simulate("change", {
                target: {
                    value: "testPid",
                },
            });
            wrapper.update();
            wrapper.find("#solrIndexPreviewButton").simulate("click");
        });

        await Promise.resolve();

        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(expect.stringMatching(/solrindex/), {
            method: "GET",
        });
        expect(wrapper.find("#solrIndexResults").text()).toEqual("testText");
    });

    it("fetches the post text", async () => {
        fetchContextValues.action.fetchText.mockResolvedValue("testText");

        const wrapper = mount(<SolrIndexer />);
        await act(async () => {
            wrapper.find("#solrIndexPid").simulate("change", {
                target: {
                    value: "testPid",
                },
            });
            wrapper.update();
            wrapper.find("#solrIndexIndexButton").simulate("click");
        });

        await Promise.resolve();

        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(expect.stringMatching(/solrindex/), {
            method: "POST",
        });
        expect(wrapper.find("#solrIndexResults").text()).toEqual("testText");
    });

    it("throws an error on api call", async () => {
        fetchContextValues.action.fetchText.mockRejectedValue({
            message: "testError",
        });

        const wrapper = mount(<SolrIndexer />);
        await act(async () => {
            wrapper.find("#solrIndexPid").simulate("change", {
                target: {
                    value: "testPid",
                },
            });
            wrapper.find("#solrIndexPreviewButton").simulate("click");
        });

        await Promise.resolve();

        expect(fetchContextValues.action.fetchText).toHaveBeenCalled();
        expect(wrapper.find("#solrIndexResults").text()).toEqual("testError");
    });
});
