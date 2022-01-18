import React from "react";
import { describe, expect, it } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import MainMenu from "./MainMenu";

describe("MainMenu", () => {
    it("renders", () => {
        const wrapper = shallow(<MainMenu />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
