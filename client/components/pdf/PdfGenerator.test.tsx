import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { render, mount } from "enzyme";
import toJson from "enzyme-to-json";
import PdfGenerator from "./PdfGenerator";

const mockUseFetchContext = jest.fn();
jest.mock("../../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));
jest.mock("../shared/BasicBreadcrumbs", () => () => "BasicBreadcrumbs");

describe("PdfGenerator", () => {
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
        const wrapper = render(<PdfGenerator />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("changes the pid input", () => {
        const wrapper = mount(<PdfGenerator />);
        wrapper.find("#pdfGeneratePid").simulate("change", {
            target: {
                value: "testPid",
            },
        });
        expect(wrapper.find("#pdfGeneratePid").instance().value).toEqual("testPid");
    });

    it("fetches the text", async () => {
        fetchContextValues.action.fetchText.mockResolvedValue("testText");

        const wrapper = mount(<PdfGenerator />);
        await act(async () => {
            wrapper.find("#pdfGeneratePid").simulate("change", {
                target: {
                    value: "testPid",
                },
            });
            wrapper.find("#pdfGenerateButton").simulate("click");
        });

        await Promise.resolve();

        expect(fetchContextValues.action.fetchText).toHaveBeenCalled();
        expect(wrapper.find("#pdfGenerateResults").text()).toEqual("testText");
    });

    it("throws an error on api call", async () => {
        fetchContextValues.action.fetchText.mockRejectedValue({
            message: "testError",
        });

        const wrapper = mount(<PdfGenerator />);
        await act(async () => {
            wrapper.find("#pdfGeneratePid").simulate("change", {
                target: {
                    value: "testPid",
                },
            });
            wrapper.find("#pdfGenerateButton").simulate("click");
        });

        await Promise.resolve();

        expect(fetchContextValues.action.fetchText).toHaveBeenCalled();
        expect(wrapper.find("#pdfGenerateResults").text()).toEqual("testError");
    });
});
