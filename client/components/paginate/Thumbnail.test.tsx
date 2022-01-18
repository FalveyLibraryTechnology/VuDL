import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import Thumbnail from "./Thumbnail";

const mockUseJobPaginatorContext = jest.fn();
jest.mock("../../context/PaginatorContext", () => ({
    usePaginatorContext: () => {
        return mockUseJobPaginatorContext();
    },
}));

describe("Thumbnail", () => {
    let props;
    let paginatorValues;
    let order;
    beforeEach(() => {
        order = [
            {
                filename: "test1.jpg",
            },
            {
                filename: "test2.jpg",
            },
            {
                filename: "test3.jpg",
            },
        ];
        paginatorValues = {
            state: {
                order,
            },
            action: {
                getLabel: jest.fn().mockReturnValue(null),
                getMagicLabel: jest.fn().mockReturnValue(null),
                setPage: jest.fn(),
                getJobImageUrl: jest.fn().mockReturnValue("www.testurl.com"),
            },
        };
        props = {
            scrollTo: jest.fn(),
            selected: true,
            number: 1,
        };
        mockUseJobPaginatorContext.mockReturnValue(paginatorValues);
    });

    it("renders", () => {
        const wrapper = shallow(<Thumbnail {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders initial state and calls appropriate functions when selected", () => {
        const wrapper = mount(<Thumbnail {...props} />);

        expect(props.scrollTo).toHaveBeenCalled();
        expect(paginatorValues.action.getJobImageUrl).toHaveBeenCalledWith(order[props.number], "thumb");
        expect(wrapper.find(".thumbnail.selected").exists()).toBeTruthy();
        expect(wrapper.text().includes("2")).toBeTruthy();
        expect(wrapper.find(".label.magic").exists()).toBeTruthy();
    });

    it("renders correctly when not selected or no label", () => {
        props.selected = false;
        paginatorValues.action.getLabel.mockReturnValue("testLabel");
        paginatorValues.action.getMagicLabel.mockReturnValue("testLabel");

        const wrapper = mount(<Thumbnail {...props} />);

        expect(props.scrollTo).not.toHaveBeenCalled();
        expect(paginatorValues.action.getJobImageUrl).toHaveBeenCalledWith(order[props.number], "thumb");
        expect(wrapper.find(".thumbnail.selected").exists()).toBeFalsy();
        expect(wrapper.find(".label.magic").exists()).toBeFalsy();
        expect(wrapper.text().includes("testLabel")).toBeTruthy();
    });

    it("calls setPage when div is clicked", () => {
        const wrapper = mount(<Thumbnail {...props} />);

        expect(paginatorValues.action.setPage).not.toHaveBeenCalledWith(props.number);
        wrapper.find(".thumbnail").simulate("click");
        expect(paginatorValues.action.setPage).toHaveBeenCalledWith(props.number);
    });
});
