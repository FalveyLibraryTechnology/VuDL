import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render } from "enzyme";
import toJson from "enzyme-to-json";
import JobList from "./JobList";

const mockJob = jest.fn();
jest.mock(
    "./Job",
    () =>
        function Job(props) {
            mockJob(props);
            return <mock-job />;
        }
);

describe("JobList", () => {
    let props;

    beforeEach(() => {
        props = {
            category: "testCategory",
            data: ["testJob"],
        };
    });

    it("renders", () => {
        const wrapper = render(<JobList {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(mockJob).toHaveBeenCalledWith(
            expect.objectContaining({
                category: props.category,
                children: "testJob",
            })
        );
    });
});
