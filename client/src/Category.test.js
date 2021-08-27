import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import Category from "./Category";

const mockjobList = jest.fn();
jest.mock(
    "./JobList",
    () =>
        function JobList(props) {
            mockjobList(props);
            return <mock-JobList />;
        }
);

describe("Category", () => {
    let props;

    beforeEach(() => {
        props = {
            data: {
                category: "testCategory",
                jobs: ["testJobs"],
            },
        };
        Object.defineProperty(window, "sessionStorage", {
            value: {
                getItem: jest.fn(() => null),
                setItem: jest.fn(() => null),
            },
            writable: true,
        });
    });

    it("renders", () => {
        const wrapper = shallow(<Category {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders no jobs", () => {
        props.data.jobs = [];
        const wrapper = render(<Category {...props} />);
        expect(wrapper.has("no jobs")).toBeTruthy();
    });

    it("calls setItem on toggle", () => {
        const component = mount(<Category {...props} />);
        expect(sessionStorage.setItem).toHaveBeenCalledWith("open-testCategory", "false");
        expect(mockjobList).not.toHaveBeenCalled();

        component.find("button").simulate("click");

        expect(sessionStorage.setItem).toHaveBeenCalledWith("open-testCategory", "true");
        expect(mockjobList).toHaveBeenCalledWith(
            expect.objectContaining({
                category: props.data.category,
                data: props.data.jobs,
            })
        );

        component.unmount();
    });
});
