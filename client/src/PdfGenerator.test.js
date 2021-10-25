import React from "react";
import { describe, expect, it } from "@jest/globals";
import { render, mount } from "enzyme";
import toJson from "enzyme-to-json";
import PdfGenerator from "./PdfGenerator";
import { FetchContextProvider } from "./context";

describe("PdfGenerator", () => {
    it("renders", () => {
        const wrapper = render(
            <FetchContextProvider>
                <PdfGenerator />
            </FetchContextProvider>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("changes the pid input", () => {
        const wrapper = mount(
            <FetchContextProvider>
                <PdfGenerator />
            </FetchContextProvider>
        );
        wrapper.find("#pdfGeneratePid").simulate("change", {
            target: {
                value: "testPid",
            },
        });
        expect(wrapper.find("#pdfGeneratePid").instance().value).toEqual("testPid");
    });
});
