import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import Thumbnail from "./Thumbnail";

describe("Thumbnail", () => {
    let props;

    beforeEach(() => {
        props = {
            scrollTo: jest.fn(),
            getLabel: jest.fn().mockReturnValue(null),
            getMagicLabel: jest.fn().mockReturnValue(null),
            setPage: jest.fn(),
            getImageUrl: jest.fn().mockReturnValue("www.testurl.com"),
            selected: true,
            number: 12,
        };
    });

    it("renders", () => {
        const wrapper = shallow(<Thumbnail {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders initial state and calls appropriate functions when selected", () => {
        const wrapper = mount(<Thumbnail {...props} />);

        expect(props.scrollTo).toHaveBeenCalled();
        expect(props.getImageUrl).toHaveBeenCalledWith(props.number, "thumb");
        expect(wrapper.find(".thumbnail.selected").exists()).toBeTruthy();
        expect(wrapper.text().includes("13")).toBeTruthy();
        expect(wrapper.find(".label.magic").exists()).toBeTruthy();
    });

    it("renders correctly when not selected or no label", () => {
        props.selected = false;
        props.getLabel.mockReturnValue("testLabel");
        props.getMagicLabel.mockReturnValue("testLabel");

        const wrapper = mount(<Thumbnail {...props} />);

        expect(props.scrollTo).not.toHaveBeenCalled();
        expect(props.getImageUrl).toHaveBeenCalledWith(props.number, "thumb");
        expect(wrapper.find(".thumbnail.selected").exists()).toBeFalsy();
        expect(wrapper.find(".label.magic").exists()).toBeFalsy();
        expect(wrapper.text().includes("testLabel")).toBeTruthy();
    });

    it("calls setPage when div is clicked", () => {
        const wrapper = mount(<Thumbnail {...props} />);

        expect(props.setPage).not.toHaveBeenCalledWith(12);
        wrapper.find(".thumbnail").simulate("click");
        expect(props.setPage).toHaveBeenCalledWith(12);
    });
});
