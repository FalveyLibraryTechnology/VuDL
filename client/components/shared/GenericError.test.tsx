import React from "react";
import { describe, expect, it } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import GenericError from "./GenericError";

describe("GenericError", () => {
    it("renders", () => {
        const message = "Test error";
        const wrapper = shallow(<GenericError message={message} />);
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.contains(message)).toBeTruthy();
    });
});
