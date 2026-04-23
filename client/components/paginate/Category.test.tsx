import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Category from "./Category";

const mockjobList = jest.fn();
jest.mock(
    "./JobList",
    () =>
        function JobList(props) {
            mockjobList(props);
            return <mock-JobList />;
        },
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
        const { asFragment } = render(<Category {...props} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders no jobs", () => {
        props.data.jobs = [];
        render(<Category {...props} />);
        expect(screen.queryAllByText("testCategory [no jobs]")).toHaveLength(1);
    });

    it("calls setItem on toggle", async () => {
        render(<Category {...props} />);
        expect(sessionStorage.setItem).toHaveBeenCalledWith("open-testCategory", "false");
        expect(mockjobList).not.toHaveBeenCalled();

        await userEvent.setup().click(screen.getByRole("button"));

        expect(sessionStorage.setItem).toHaveBeenCalledWith("open-testCategory", "true");
        expect(mockjobList).toHaveBeenCalledWith(
            expect.objectContaining({
                category: props.data.category,
                data: props.data.jobs,
            }),
        );
    });
});
