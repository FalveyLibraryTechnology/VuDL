import React from "react";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { shallow } from "enzyme";
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
    });

    it("disallows all empty pid settings", () => {
        props.allowChangeParentPid = false;
        expect(() => shallow(<CreateObject {...props} />)).toThrowError(
            "allowChangeParentPid and allowNoParentPid cannot both be false when parentPid is empty."
        );
    });

    it("disallows incompatible allowNoParentPid/allowChangeParentPid settings", () => {
        props.allowNoParentPid = true;
        props.allowChangeParentPid = false;
        expect(() => shallow(<CreateObject {...props} />)).toThrowError(
            "allowNoParentPid=true requires allowChangeParentPid to be true"
        );
    });
});
