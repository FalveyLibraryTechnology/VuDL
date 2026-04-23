import { describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import SolrIndexer from "./SolrIndexer";

jest.mock("./SinglePidIndexer", () => () => "SinglePidIndexer");
jest.mock("./PidRangeIndexer", () => () => "PidRangeIndexer");
jest.mock("../shared/BasicBreadcrumbs", () => () => "BasicBreadcrumbs");

const mockUseFetchContext = jest.fn();
jest.mock("../../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));

describe("SolrIndexer", () => {
    it("renders", () => {
        const { asFragment } = render(<SolrIndexer />);
        expect(asFragment()).toMatchSnapshot();
    });
});
