import React from "react";
import { describe, beforeEach, expect, it } from "@jest/globals";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import BlurSavingTextField, { BlurSavingTextFieldProps } from "./BlurSavingTextField";

jest.mock("@mui/material/TextField", function () {
    return () => "TextField";
});

describe("BlurSavingTextField", () => {
    let props: BlurSavingTextFieldProps;
    let value: string;
    let setterWasCalled: boolean;
    beforeEach(() => {
        value = "foo";
        setterWasCalled = false;
        props = {
            value,
            setValue: (x: string) => {
                setterWasCalled = true;
                value = x;
            },
        };
    });

    it("renders using the initial value", () => {
        const wrapper = mount(<BlurSavingTextField {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("updates the temporary internal value appropriately", () => {
        const wrapper = mount(<BlurSavingTextField {...props} />);
        act(() => {
            wrapper
                .children()
                .at(0)
                .props()
                .onChange({ target: { value: "bar" } });
        });
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        // Even though the internal value has changed, the external hasn't (because
        // we didn't trigger blur yet):
        expect(value).toEqual("foo");
    });

    it("saves on blur", () => {
        const wrapper = mount(<BlurSavingTextField {...props} />);
        act(() => {
            wrapper
                .children()
                .at(0)
                .props()
                .onBlur({ target: { value: "bar" } });
        });
        expect(setterWasCalled).toEqual(true);
        expect(value).toEqual("bar");
    });

    it("doesn't call the save callback if nothing has changed", () => {
        const wrapper = mount(<BlurSavingTextField {...props} />);
        act(() => {
            wrapper
                .children()
                .at(0)
                .props()
                .onBlur({ target: { value: "foo" } });
        });
        expect(setterWasCalled).toEqual(false);
        expect(value).toEqual("foo");
    });
});
