import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import PaginatorList from "./PaginatorList";

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
    let props;

    beforeEach(() => {
        props = {
            pageCount: 1,
            currentPage: 0,
        };
    });

    it("renders", () => {
        const wrapper = shallow(<PaginatorList {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders a thumbnail", () => {
        expect(mockThumbnail).not.toHaveBeenCalled();
        render(<PaginatorList {...props} />);
        expect(mockThumbnail).toHaveBeenCalledWith(
            expect.objectContaining({
                scrollTo: expect.any(Function),
                selected: true,
                number: 0,
            })
        );
    });
});
