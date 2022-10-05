import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import DatastreamDublinCoreEditField from "./DatastreamDublinCoreEditField";

describe("DatastreamDublinCoreEditField", () => {
    let setValue: () => void;
    let fieldType: string;
    let legalValues: Array<string>;

    function getField(): React.ReactElement {
        const props = {
            value: "foo",
            setValue,
            fieldType,
            legalValues,
        };
        return <DatastreamDublinCoreEditField {...props} />;
    }

    beforeEach(() => {
        setValue = jest.fn();
        fieldType = "text";
        legalValues = [];
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders a text field", () => {
        const wrapper = shallow(getField());

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders an html field", () => {
        fieldType = "html";
        const wrapper = shallow(getField());

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders an unknown field", () => {
        fieldType = "unknown";
        const wrapper = shallow(getField());

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders a locked field", () => {
        fieldType = "locked";
        const wrapper = shallow(getField());

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders a dropdown field", () => {
        fieldType = "dropdown";
        legalValues = ["foo", "bar", "baz"];
        const wrapper = shallow(getField());

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders a dropdown field with an unexpected value", () => {
        fieldType = "dropdown";
        const wrapper = shallow(getField());

        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
