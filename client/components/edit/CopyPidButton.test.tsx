import CopyPidButton from "./CopyPidButton";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

jest.mock(
    "@mui/icons-material/ContentCopy",
    () =>
        ({ titleAccess }: { titleAccess: string }) =>
            titleAccess,
);

describe("CopyPidButton", () => {
    it("renders", async () => {
        const { asFragment } = render(<CopyPidButton pid="foo" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("copies text to clipboard", async () => {
        const user = userEvent.setup();
        render(<CopyPidButton pid="foo" />);
        const button = screen.getByText("Copy PID (foo) to clipboard");
        await user.click(button);
        expect(await navigator.clipboard.readText()).toEqual("foo");
    });
});
