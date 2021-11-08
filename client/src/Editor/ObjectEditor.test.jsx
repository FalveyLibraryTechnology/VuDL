import React from "react";
import { describe, expect, it } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import ObjectEditor from "./ObjectEditor";

describe("ObjectEditor", () => {
    it("renders", () => {
        const wrapper = shallow(<ObjectEditor pid="foo:123" />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
