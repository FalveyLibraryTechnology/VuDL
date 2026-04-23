import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { render, act } from "@testing-library/react";
import BlurSavingTextField, { BlurSavingTextFieldProps } from "./BlurSavingTextField";

const mockTextField = jest.fn();
jest.mock("@mui/material/TextField", function () {
    return (props) => {
        mockTextField(props);
        return "TextField: " + JSON.stringify(props);
    };
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
        const { asFragment } = render(<BlurSavingTextField {...props} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("updates the temporary internal value appropriately", () => {
        mockTextField.mockClear();
        const { asFragment } = render(<BlurSavingTextField {...props} />);
        expect(asFragment()).toMatchSnapshot();

        // Trigger the onChange handler with a new value
        const changeHandler = mockTextField.mock.calls[0][0].onChange;
        act(() => {
            changeHandler({ target: { value: "bar" } });
        });

        // The snapshot should show the updated temporary value
        expect(asFragment()).toMatchSnapshot();

        // Even though the internal value has changed, the external hasn't (because
        // we didn't trigger blur yet):
        expect(value).toEqual("foo");
    });

    it("saves on blur", () => {
        mockTextField.mockClear();
        render(<BlurSavingTextField {...props} />);
        const blurHandler = mockTextField.mock.calls[0][0].onBlur;
        act(() => {
            blurHandler({ target: { value: "bar" } });
        });
        expect(setterWasCalled).toEqual(true);
        expect(value).toEqual("bar");
    });

    it("doesn't call the save callback if nothing has changed", () => {
        mockTextField.mockClear();
        render(<BlurSavingTextField {...props} />);
        const blurHandler = mockTextField.mock.calls[0][0].onBlur;
        act(() => {
            blurHandler({ target: { value: "foo" } });
        });
        expect(setterWasCalled).toEqual(false);
        expect(value).toEqual("foo");
    });
});
