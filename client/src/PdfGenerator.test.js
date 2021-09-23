import React from "react";
import { describe, expect, it } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import PdfGenerator from "./PdfGenerator";

describe("PdfGenerator", () => {
    it("renders", () => {
        const wrapper = shallow(<PdfGenerator />);
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
});
