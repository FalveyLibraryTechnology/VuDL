import React from "react";
import { act } from "react-dom/test-utils";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import JobPaginator from "./JobPaginator";
import * as JobPaginatorState from "./JobPaginatorState";

jest.mock("./JobPaginatorState");
jest.mock("./PaginatorControls", () => () => "PaginatorControls");
jest.mock("./PaginatorList", () => () => "PaginatorList");
jest.mock("./JobPaginatorZoomToggle", () => () => "JobPaginatorZoomToggle");

describe("JobPaginator", () => {
    let props;
    beforeEach(() => {
        jest.spyOn(JobPaginatorState, "getJob").mockResolvedValue({
            order: [
                {
                    filename: "test1",
                    label: "test2",
                },
            ],
        });

        jest.spyOn(JobPaginatorState, "getStatus").mockResolvedValue({
            file_problems: {
                deleted: [],
                added: [],
            },
        });
        props = {
            initialCategory: "testCategory",
            initialJob: "testJob",
        };
    });

    it("renders", () => {
        const wrapper = shallow(<JobPaginator {...props} />);
        expect(wrapper.contains(props.initialCategory)).toBeTruthy();
        expect(wrapper.contains(props.initialJob)).toBeTruthy();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("should loadJob from useEffect", async () => {
        await act(async () => {
            await mount(<JobPaginator {...props} />);
        });
        expect(JobPaginatorState.getJob).toHaveBeenCalled();
        expect(JobPaginatorState.getStatus).toHaveBeenCalled();
    });
});
