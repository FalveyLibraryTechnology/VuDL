import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import JobList from "./JobList";

const mockJob = jest.fn();
jest.mock(
    "./Job",
    () =>
        function Job(props) {
            mockJob(props);
            return <mock-job />;
        },
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
        const { asFragment } = render(<JobList {...props} />);
        expect(asFragment()).toMatchSnapshot();
        expect(mockJob).toHaveBeenCalledWith(
            expect.objectContaining({
                category: props.category,
                children: "testJob",
            }),
        );
    });
});
