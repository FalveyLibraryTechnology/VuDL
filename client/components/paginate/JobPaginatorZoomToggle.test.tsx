import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import JobPaginatorZoomToggle from "./JobPaginatorZoomToggle";

const mockUseJobPaginatorContext = jest.fn();
jest.mock("../../context/PaginatorContext", () => ({
    usePaginatorContext: () => {
        return mockUseJobPaginatorContext();
    },
}));
jest.mock("./PaginatorZoomy", () => () => "PaginatorZoomy");
jest.mock("./PaginatorPreview", () => () => "PaginatorPreview");

describe("JobPaginatorZoomToggle", () => {
    let paginatorValues;
    beforeEach(() => {
        paginatorValues = {
            state: {
                order: [
                    {
                        filename: "test.jpg",
                    },
                ],
                zoom: true,
                currentPage: 0,
            },
            action: {
                getJobImageUrl: jest.fn(),
            },
        };
        mockUseJobPaginatorContext.mockReturnValue(paginatorValues);
    });

    it("renders", () => {
        render(<JobPaginatorZoomToggle />);
        expect(screen.queryAllByText("PaginatorZoomy")).toHaveLength(1);
    });

    it("renders preview not available", () => {
        paginatorValues.state.order = [];
        const { asFragment } = render(<JobPaginatorZoomToggle />);
        expect(asFragment()).toMatchSnapshot();
        expect(asFragment().textContent.includes("Preview not available")).toBeTruthy();
    });

    it("renders PaginatorZoomy", () => {
        render(<JobPaginatorZoomToggle />);

        expect(screen.queryAllByText("PaginatorZoomy")).toHaveLength(1);
        expect(paginatorValues.action.getJobImageUrl).toHaveBeenCalledWith(paginatorValues.state.order[0], "large");
    });

    it("renders PaginatorPreview", () => {
        paginatorValues.state.zoom = false;
        render(<JobPaginatorZoomToggle />);

        expect(screen.queryAllByText("PaginatorPreview")).toHaveLength(1);
        expect(paginatorValues.action.getJobImageUrl).toHaveBeenCalledWith(paginatorValues.state.order[0], "medium");
    });
});
