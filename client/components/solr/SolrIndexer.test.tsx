import React from "react";
import { describe, expect, it, jest } from "@jest/globals";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import SolrIndexer from "./SolrIndexer";

jest.mock("./SinglePidIndexer", () => () => "SinglePidIndexer");
jest.mock("./PidRangeIndexer", () => () => "PidRangeIndexer");

const mockUseFetchContext = jest.fn();
jest.mock("../../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));

describe("SolrIndexer", () => {
    it("renders", () => {
        const wrapper = mount(<SolrIndexer />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
