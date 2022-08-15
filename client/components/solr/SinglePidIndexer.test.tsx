import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import SinglePidIndexer from "./SinglePidIndexer";

const mockUseFetchContext = jest.fn();
jest.mock("../../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));

describe("SinglePidIndexer", () => {
    let fetchContextValues;
    let wrapper;
    let setResults;
    beforeEach(() => {
        fetchContextValues = {
            action: {
                fetchText: jest.fn(),
            },
        };
        mockUseFetchContext.mockReturnValue(fetchContextValues);
        setResults = jest.fn();
        wrapper = mount(<SinglePidIndexer setResults={setResults} />);
    });

    it("renders", () => {
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("changes the pid input", () => {
        wrapper.find("#solrIndexPid").simulate("change", {
            target: {
                value: "testPid",
            },
        });
        expect(wrapper.find("#solrIndexPid").instance().value).toEqual("testPid");
    });

    it("fetches the preview text", async () => {
        fetchContextValues.action.fetchText.mockResolvedValue("testText");

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
        expect(setResults).toHaveBeenCalledWith("testText");
    });

    it("fetches the post text", async () => {
        fetchContextValues.action.fetchText.mockResolvedValue("testText");

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
        expect(setResults).toHaveBeenCalledWith("testText");
    });

    it("throws an error on api call", async () => {
        fetchContextValues.action.fetchText.mockRejectedValue({
            message: "testError",
        });

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
        expect(setResults).toHaveBeenCalledWith("testError");
    });
});
