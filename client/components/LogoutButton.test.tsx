import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import toJson from "enzyme-to-json";
import LogoutButton from "./LogoutButton";

describe("LogoutButton", () => {
    beforeEach(() => {
        Object.defineProperty(window, "sessionStorage", {
            value: {
                getItem: jest.fn(() => null),
                removeItem: jest.fn(() => null),
            },
            writable: true,
        });
    });

    it("renders", () => {
        const wrapper = shallow(<LogoutButton />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("clears the token", () => {
        const component = mount(<LogoutButton />);

        expect(sessionStorage.removeItem).not.toHaveBeenCalledWith("token");

        component.find("a").simulate("click");

        expect(sessionStorage.removeItem).toHaveBeenCalledWith("token");

        component.unmount();
    });
});
