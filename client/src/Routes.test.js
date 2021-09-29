import React from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import Routes from "./Routes";

const mockjobPaginator = jest.fn();
jest.mock(
    "./JobPaginator",
    () =>
        function JobPaginator(props) {
            mockjobPaginator(props);
            return <mock-JobPaginator />;
        }
);
jest.mock("./MainMenu", () => () => "MainMenu");
jest.mock("./JobSelector", () => () => "JobSelector");
jest.mock("./PdfGenerator", () => () => "PdfGenerator");
jest.mock("./SolrIndexer", () => () => "SolrIndexer");

describe("Routes", () => {
    it("render", () => {
        const wrapper = shallow(<Routes />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders MainMenu", () => {
        const wrapper = mount(
            <MemoryRouter initialEntries={["/"]}>
                <Routes />
            </MemoryRouter>
        );
        expect(wrapper.contains("MainMenu")).toBeTruthy();
    });

    it("renders JobSelector", () => {
        const wrapper = mount(
            <MemoryRouter initialEntries={["/paginate"]}>
                <Routes />
            </MemoryRouter>
        );
        expect(wrapper.contains("JobSelector")).toBeTruthy();
    });

    it("renders JobPaginatorHook", () => {
        mount(
            <MemoryRouter initialEntries={["/paginate/testCategory/testJob"]}>
                <Routes />
            </MemoryRouter>
        );
        expect(mockjobPaginator).toHaveBeenCalledWith(
            expect.objectContaining({
                initialCategory: "testCategory",
                initialJob: "testJob",
            })
        );
    });

    it("renders PdfGenerator", () => {
        const wrapper = mount(
            <MemoryRouter initialEntries={["/pdf"]}>
                <Routes />
            </MemoryRouter>
        );
        expect(wrapper.contains("PdfGenerator")).toBeTruthy();
    });

    it("renders SolrIndexer", () => {
        const wrapper = mount(
            <MemoryRouter initialEntries={["/solr"]}>
                <Routes />
            </MemoryRouter>
        );
        expect(wrapper.contains("SolrIndexer")).toBeTruthy();
    });
});
