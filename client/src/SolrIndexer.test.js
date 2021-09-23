import React from "react";
import { describe, expect, it } from "@jest/globals";
import { mount, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import SolrIndexer from "./SolrIndexer";

describe("SolrIndexer", () => {
    it("renders", () => {
        const wrapper = shallow(<SolrIndexer />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("changes the pid input", () => {
        const wrapper = mount(<SolrIndexer />);
        wrapper.find("#solrIndexPid").simulate("change", {
            target: {
                value: "testPid",
            },
        });
        expect(wrapper.find("#solrIndexPid").instance().value).toEqual("testPid");
    });
});
