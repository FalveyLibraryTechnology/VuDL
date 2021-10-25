import React from "react";
import { describe, expect, it } from "@jest/globals";
import { mount, render } from "enzyme";
import toJson from "enzyme-to-json";
import SolrIndexer from "./SolrIndexer";
import { FetchContextProvider } from "./context";

describe("SolrIndexer", () => {
    it("renders", () => {
        const wrapper = render(
            <FetchContextProvider>
                <SolrIndexer />
            </FetchContextProvider>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("changes the pid input", () => {
        const wrapper = mount(
            <FetchContextProvider>
                <SolrIndexer />
            </FetchContextProvider>
        );
        wrapper.find("#solrIndexPid").simulate("change", {
            target: {
                value: "testPid",
            },
        });
        expect(wrapper.find("#solrIndexPid").instance().value).toEqual("testPid");
    });
});
