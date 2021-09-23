import React from "react";
import { describe, expect, it, jest } from "@jest/globals";
import { render } from "enzyme";
import toJson from "enzyme-to-json";
import VuDLPrep from "./VuDLPrep";

jest.mock("./LogoutButton", () => () => "LogoutButton");
jest.mock("./Routes", () => () => "Routes");

describe("VuDLPrep", () => {
    it("renders", () => {
        const wrapper = render(<VuDLPrep />);
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.has("LogoutButton")).toBeTruthy();
        expect(wrapper.has("Routes")).toBeTruthy();
    });
});
