import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import PidRangeIndexer from "./PidRangeIndexer";

const mockUseFetchContext = jest.fn();
jest.mock("../../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));

describe("PidRangeIndexer", () => {
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
        wrapper = mount(<PidRangeIndexer setResults={setResults} />);
    });

    it("renders", () => {
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("submits appropriate JSON", async () => {
        fetchContextValues.action.fetchText.mockResolvedValue("testText");

        await act(async () => {
            wrapper.find("#pidRangePrefix").simulate("change", {
                target: {
                    value: "foo:",
                },
            });
            await wrapper.update();
            wrapper.find("#pidRangeFrom").simulate("change", {
                target: {
                    value: "1",
                },
            });
            await wrapper.update();
            expect(wrapper.find("#pidRangeFrom").instance().value).toEqual("1");
            wrapper.find("#pidRangeTo").simulate("change", {
                target: {
                    value: "5",
                },
            });
            await wrapper.update();
            expect(wrapper.find("#pidRangeTo").instance().value).toEqual("5");
            wrapper.find("button").simulate("click");
        });

        await Promise.resolve();

        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            expect.stringMatching(/messenger\/queuesolrindex/),
            {
                method: "POST",
                body: '{"prefix":"foo:","to":"5","from":"1"}',
            },
            { "Content-Type": "application/json" },
        );
        expect(setResults).toHaveBeenCalledWith("testText");
    });

    it("throws an error on api call", async () => {
        fetchContextValues.action.fetchText.mockRejectedValue({
            message: "testError",
        });

        await act(async () => {
            wrapper.find("button").simulate("click");
        });

        await Promise.resolve();

        expect(fetchContextValues.action.fetchText).toHaveBeenCalled();
        expect(setResults).toHaveBeenCalledWith("testError");
    });
});
