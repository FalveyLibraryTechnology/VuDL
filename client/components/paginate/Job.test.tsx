import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, waitFor } from "@testing-library/react";
import { FetchContextProvider } from "../../context/FetchContext";
import Job from "./Job";

const mockjobClickable = jest.fn();
jest.mock(
    "./JobClickable",
    () =>
        function JobClickable(props) {
            mockjobClickable(props);
            return "JobClickable";
        },
);

describe("Job", () => {
    let props;

    beforeEach(() => {
        props = {
            category: "testCategory",
            children: "testChildren",
        };
        // Mock fetch to return a successful response
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
                ingest_info: "",
                published: false,
                derivatives: { building: false },
            }),
        });
    });

    it("renders", async () => {
        const { asFragment } = render(
            <FetchContextProvider>
                <Job {...props} />
            </FetchContextProvider>,
        );

        // Wait for the async fetch and state updates to complete
        await waitFor(() => {
            expect(asFragment()).toMatchSnapshot();
        });
    });
});
