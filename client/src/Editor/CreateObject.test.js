import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import CreateObject from "./CreateObject";

describe("CreateObject", () => {
    let props;

    beforeEach(() => {
        props = {
            parentPid: "",
            allowNoParentPid: false,
            allowChangeParentPid: true,
        };
    });

    it("renders appropriately with default settings", () => {
        const wrapper = shallow(<CreateObject {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders appropriately with noParent and parent change enabled", () => {
        props.allowNoParentPid = true;
        const wrapper = shallow(<CreateObject {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders appropriately with editing disabled", () => {
        props.parentPid = "foo:1234";
        props.allowChangeParentPid = false;
        const wrapper = shallow(<CreateObject {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    })
});