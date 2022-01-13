import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import JobPaginatorZoomToggle from "./JobPaginatorZoomToggle";

const mockUseJobPaginatorContext = jest.fn();
jest.mock("../../context/PaginatorContext", () => ({
    usePaginatorContext: () => {
        return mockUseJobPaginatorContext();
    },
}));
jest.mock("./PaginatorZoomy", () => () => "PaginatorZoomy");
jest.mock("./PaginatorPreview", () => () => "PaginatorPreview");

describe("JobPaginatorZoomToggle", () => {
    let paginatorValues;
    beforeEach(() => {
        paginatorValues = {
            state: {
                order: [
                    {
                        filename: "test.jpg",
                    },
                ],
                zoom: true,
                currentPage: 0,
            },
            action: {
                getJobImageUrl: jest.fn(),
            },
        };
        mockUseJobPaginatorContext.mockReturnValue(paginatorValues);
    });

    it("renders", () => {
        const wrapper = shallow(<JobPaginatorZoomToggle />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders preview not available", () => {
        paginatorValues.state.order = [];
        const wrapper = shallow(<JobPaginatorZoomToggle />);
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.text().includes("Preview not available")).toBeTruthy();
    });

    it("renders PaginatorZoomy", () => {
        const wrapper = mount(<JobPaginatorZoomToggle />);

        expect(wrapper.contains("PaginatorZoomy")).toBeTruthy();
        expect(paginatorValues.action.getJobImageUrl).toHaveBeenCalledWith(paginatorValues.state.order[0], "large");
    });

    it("renders PaginatorPreview", () => {
        paginatorValues.state.zoom = false;
        const wrapper = mount(<JobPaginatorZoomToggle />);

        expect(wrapper.contains("PaginatorPreview")).toBeTruthy();
        expect(paginatorValues.action.getJobImageUrl).toHaveBeenCalledWith(paginatorValues.state.order[0], "medium");
    });
});
