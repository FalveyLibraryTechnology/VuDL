import React from "react";
import { act } from "react-dom/test-utils";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mount, render } from "enzyme";
import toJson from "enzyme-to-json";
import JobPaginator from "./JobPaginator";
import { FetchContextProvider } from "../../context/FetchContext";

const mockUseJobPaginatorContext = jest.fn();
jest.mock("../../context/PaginatorContext", () => ({
    usePaginatorContext: () => {
        return mockUseJobPaginatorContext();
    },
}));
jest.mock("../../context/JobPaginatorState");
jest.mock("./PaginatorControls", () => () => "PaginatorControls");
jest.mock("./PaginatorList", () => () => "PaginatorList");
jest.mock("./JobPaginatorZoomToggle", () => () => "JobPaginatorZoomToggle");

describe("JobPaginator", () => {
    let props;
    let paginatorValues;
    beforeEach(() => {
        props = {
            initialCategory: "testCategory",
            initialJob: "testJob",
        };
        paginatorValues = {
            state: {
                category: props.initialCategory,
                job: props.initialJob,
            },
            action: {
                loadJob: jest.fn(),
            },
        };
        mockUseJobPaginatorContext.mockReturnValue(paginatorValues);
    });

    it("renders", () => {
        const wrapper = render(
            <FetchContextProvider>
                <JobPaginator {...props} />
            </FetchContextProvider>
        );
        expect(wrapper.children().text().includes(props.initialCategory)).toBeTruthy();
        expect(wrapper.children().text().includes(props.initialJob)).toBeTruthy();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("should loadJob from useEffect", async () => {
        await act(async () => {
            await mount(
                <FetchContextProvider>
                    <JobPaginator {...props} />
                </FetchContextProvider>
            );
        });
        expect(paginatorValues.action.loadJob).toHaveBeenCalledWith(props.initialCategory, props.initialJob);
    });
});
