import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import JobPaginatorZoomToggle from "./JobPaginatorZoomToggle";

jest.mock("./PaginatorZoomy", () => () => "PaginatorZoomy");
jest.mock("./PaginatorPreview", () => () => "PaginatorPreview");

describe("JobPaginatorZoomToggle", () => {
    let props;
    beforeEach(() => {
        props = {
            zoom: true,
            getJobImageUrl: jest.fn(),
        };
    });

    it("renders", () => {
        const wrapper = shallow(<JobPaginatorZoomToggle {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders PaginatorZoomy", () => {
        const wrapper = mount(<JobPaginatorZoomToggle {...props} />);

        expect(wrapper.contains("PaginatorZoomy")).toBeTruthy();
        expect(props.getJobImageUrl).toHaveBeenCalledWith("large");
    });

    it("renders PaginatorPreview", () => {
        props.zoom = false;
        const wrapper = mount(<JobPaginatorZoomToggle {...props} />);

        expect(wrapper.contains("PaginatorPreview")).toBeTruthy();
        expect(props.getJobImageUrl).toHaveBeenCalledWith("medium");
    });
});
