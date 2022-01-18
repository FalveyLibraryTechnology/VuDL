import React from "react";
import { describe, expect, it } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import EditHome from "./EditHome";

describe("EditHome", () => {
    it("renders", () => {
        const wrapper = shallow(<EditHome />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
