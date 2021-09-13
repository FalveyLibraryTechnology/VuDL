import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import PaginatorControlGroup from "./PaginatorControlGroup";

describe("PaginatorControlGroup", () => {
    let props;

    beforeEach(() => {
        props = {
            callback: jest.fn(),
            children: ["testChild"],
            label: "testLabel",
        };
    });

    it("renders", () => {
        const wrapper = shallow(<PaginatorControlGroup {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("calls callback on child click", () => {
        const wrapper = mount(<PaginatorControlGroup {...props} />);

        expect(props.callback).not.toHaveBeenCalledWith("testChild");

        wrapper.find("button").simulate("click");

        expect(props.callback).toHaveBeenCalledWith("testChild");
    });
});
