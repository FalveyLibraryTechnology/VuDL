import React from "react";
import { describe, expect, it, jest } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import JobSelector from "./JobSelector";

const mockCategory = jest.fn();
jest.mock(
    "./Category",
    () =>
        function Category(props) {
            mockCategory(props);
            return <mock-Category />;
        }
);

describe("JobSelector", () => {
    // TODO: Implement after AjaxHelper refactor
    // let data;
    // beforeEach(() => {
    //     data = {
    //         category1: {
    //             category: "category1",
    //             jobs: ["testJob1"],
    //         },
    //         category2: {
    //             category: "category2",
    //             jobs: [],
    //         },
    //     };
    // });

    it("renders", () => {
        const wrapper = shallow(<JobSelector />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
