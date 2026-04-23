import { act } from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import JobSelector from "./JobSelector";
import { FetchContextProvider } from "../../context/FetchContext";
const mockCategory = jest.fn();
jest.mock(
    "./Category",
    () =>
        function Category(props) {
            mockCategory(props);
            return <mock-Category />;
        },
);
jest.mock("../shared/BasicBreadcrumbs", () => () => "BasicBreadcrumbs");

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

    it("renders", async () => {
        response.json.mockResolvedValueOnce({});
        global.fetch.mockResolvedValueOnce(response);
        let asFragment;
        await act(async () => {
            const result = render(
                <FetchContextProvider>
                    <JobSelector />
                </FetchContextProvider>,
            );
            asFragment = result.asFragment;
        });
        expect(asFragment()).toMatchSnapshot();
    });

    it("sets category components", async () => {
        response.json.mockResolvedValueOnce(data);
        global.fetch.mockResolvedValueOnce(response);
        await act(async () => {
            render(
                <FetchContextProvider>
                    <JobSelector />
                </FetchContextProvider>,
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
