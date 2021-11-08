import React from "react";
import { act } from "react-dom/test-utils";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mount, render } from "enzyme";
import toJson from "enzyme-to-json";
import JobPaginator from "./JobPaginator";
import { FetchContextProvider } from "./context";
import { getJobUrl } from "./routes";

jest.mock("./JobPaginatorState");
jest.mock("./PaginatorControls", () => () => "PaginatorControls");
jest.mock("./PaginatorList", () => () => "PaginatorList");
jest.mock("./JobPaginatorZoomToggle", () => () => "JobPaginatorZoomToggle");

describe("JobPaginator", () => {
    let props;
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        order: ["testOrder"],
                        file_problems: {
                            deleted: 0,
                            added: 0,
                        },
                    }),
            })
        );
        props = {
            initialCategory: "testCategory",
            initialJob: "testJob",
        };
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
        expect(global.fetch).toHaveBeenCalledWith(
            getJobUrl(props.initialCategory, props.initialJob),
            expect.objectContaining({
                method: "GET",
            })
        );
    });
});
