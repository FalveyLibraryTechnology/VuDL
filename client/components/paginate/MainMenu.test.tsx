import { describe, expect, it } from "@jest/globals";
import MainMenu from "./MainMenu";
import { render } from "@testing-library/react";

describe("MainMenu", () => {
    it("renders", () => {
        const { asFragment } = render(<MainMenu />);
        expect(asFragment()).toMatchSnapshot();
    });
});
