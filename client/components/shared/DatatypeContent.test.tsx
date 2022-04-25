import React from "react";
import { describe, beforeEach, expect, it } from "@jest/globals";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import DatatypeContent from "./DatatypeContent";

describe("DatatypeContent", () => {
    let props;
    beforeEach(() => {
        props = {
            data: "",
            mimeType: "",
        };
    });

    it("renders img on image primaryType", () => {
        props.data = "test1";
        props.mimeType = "image/jpeg";
        const wrapper = mount(<DatatypeContent {...props} />);

        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.find("img.viewContentImage").exists()).toBeTruthy();
    });

    it("renders textarea on text primaryType", () => {
        props.data = "testXml";
        props.mimeType = "text/xml";
        const wrapper = mount(<DatatypeContent {...props} />);

        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.find("div.viewContentText").text()).toContain(props.data);
    });

    it("renders object on application/pdf", () => {
        props.data = "testPdf";
        props.mimeType = "application/pdf";
        const wrapper = mount(<DatatypeContent {...props} />);

        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.find("object.viewContentObject").exists()).toBeTruthy();
    });

    it("renders audio tag on audio primaryType", () => {
        props.data = "testAudio";
        props.mimeType = "audio/mpeg3";
        const wrapper = mount(<DatatypeContent {...props} />);

        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.find("div.viewContentAudio").exists()).toBeTruthy();
    });
});
