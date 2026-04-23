import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogoutButton from "./LogoutButton";

const mockUseFetchContext = jest.fn();
jest.mock("../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));

describe("LogoutButton", () => {
    let fetchValues;
    beforeEach(() => {
        fetchValues = {
            state: {
                token: "foo",
            },
            action: {
                clearToken: jest.fn(),
            },
        };
        mockUseFetchContext.mockReturnValue(fetchValues);
    });

    it("renders correctly when logged in", async () => {
        const { asFragment } = render(<LogoutButton />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly when logged out", async () => {
        fetchValues.state.token = null;
        const { asFragment } = render(<LogoutButton />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("clears the token", async () => {
        render(<LogoutButton />);

        expect(fetchValues.action.clearToken).not.toHaveBeenCalled();

        // Clicking a link will trigger a console error about navigation not being
        // implemented -- but that doesn't hurt the test, so let's suppress it by
        // mocking the error method.
        // TODO: figure out why and come up with a better solution than hiding the errors.
        jest.spyOn(console, "error").mockImplementation(jest.fn());
        await userEvent.setup().click(screen.getByText("Log Out"));
        expect(fetchValues.action.clearToken).toHaveBeenCalled();
    });
});
