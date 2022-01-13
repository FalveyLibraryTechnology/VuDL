import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import PaginatorList from "./PaginatorList";

const mockUseJobPaginatorContext = jest.fn();
jest.mock("../../context/PaginatorContext", () => ({
    usePaginatorContext: () => {
        return mockUseJobPaginatorContext();
    },
}));
const mockThumbnail = jest.fn();
jest.mock(
    "./Thumbnail",
    () =>
        function Thumbnail(props) {
            mockThumbnail(props);
            return "Thumbnail";
        }
);

describe("PaginatorList", () => {
    let paginatorValues;

    beforeEach(() => {
        paginatorValues = {
            state: {
                order: [
                    {
                        filename: "test.jpg",
                    },
                ],
                currentPage: 0,
            },
        };
        mockUseJobPaginatorContext.mockReturnValue(paginatorValues);
    });

    it("renders thumbnails for pages", () => {
        const wrapper = shallow(<PaginatorList />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders empty element when pages are absent", () => {
        paginatorValues.state.order = [];
        const wrapper = shallow(<PaginatorList />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders a thumbnail", () => {
        expect(mockThumbnail).not.toHaveBeenCalled();
        render(<PaginatorList />);
        expect(mockThumbnail).toHaveBeenCalledWith(
            expect.objectContaining({
                scrollTo: expect.any(Function),
                selected: true,
                number: 0,
            })
        );
    });
});
