import React from "react";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import PaginatorPreview from "./PaginatorPreview";

describe("PaginatorPreview", () => {
    let props;

    beforeEach(() => {
        props = {
            img: "testImage",
        };
    });

    it("renders", () => {
        const wrapper = mount(<PaginatorPreview {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.find(".preview-image").exists()).toBeTruthy();
    });

    it("does not render image", () => {
        props.img = "";
        const wrapper = mount(<PaginatorPreview {...props} />);
        expect(wrapper.find(".preview-image").exists()).toBeFalsy();
    });
});
