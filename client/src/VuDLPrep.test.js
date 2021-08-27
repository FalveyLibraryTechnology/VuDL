import React from "react";
import { describe, expect, it } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import VuDLPrep from "./VuDLPrep";

describe("VuDLPrep", () => {
    it("renders", () => {
        const wrapper = shallow(<VuDLPrep />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
