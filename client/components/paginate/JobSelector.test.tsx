import React from "react";
import { act } from "react-dom/test-utils";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, mount } from "enzyme";
import toJson from "enzyme-to-json";
import JobSelector from "./JobSelector";
import { FetchContextProvider } from "../../context/FetchContext";
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
    let data;
    let response;
    beforeEach(() => {
        global.fetch = jest.fn();
        response = {
            json: jest.fn(),
            ok: true,
            status: 200,
        };
        data = {
            category1: {
                category: "category1",
                jobs: ["testJob1"],
            },
            category2: {
                category: "category2",
                jobs: [],
            },
        };
    });

    it("renders", () => {
        const wrapper = render(
            <FetchContextProvider>
                <JobSelector />
            </FetchContextProvider>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("sets category components", async () => {
        response.json.mockResolvedValueOnce(data);
        global.fetch.mockResolvedValueOnce(response);
        await act(async () => {
            await mount(
                <FetchContextProvider>
                    <JobSelector />
                </FetchContextProvider>
            );
        });

        expect(mockCategory).toHaveBeenCalledWith({
            data: data.category1,
        });
        expect(mockCategory).toHaveBeenCalledWith({
            data: data.category2,
        });
    });
});
