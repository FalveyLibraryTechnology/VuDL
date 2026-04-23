import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react";
import GenericError from "./GenericError";

describe("GenericError", () => {
    it("renders", () => {
        const message = "Test error";
        const { asFragment } = render(<GenericError message={message} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
