import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { waitFor } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as EditorContextModule from "../../context/EditorContext";
import ObjectButtonBar from "./ObjectButtonBar";

jest.mock("./EditParentsButton", () => () => "EditParentsButton");
jest.mock("./ObjectPreviewButton", () => () => "ObjectPreviewButton");
jest.mock("./ObjectStatus", () => () => "ObjectStatus");
jest.mock("./DeleteObjectButton", () => () => "DeleteObjectButton");
jest.mock(
    "@mui/icons-material/Refresh",
    () =>
        ({ titleAccess }: { titleAccess: string }) =>
            titleAccess,
);

describe("ObjectButtonBar", () => {
    let pid: string;
    let mockContext;

    beforeEach(() => {
        pid = "foo:123";
        mockContext = {
            state: { objectDetailsStorage: {}, vufindUrl: "" },
            action: {
                clearPidFromChildListStorage: jest.fn(),
            },
        };
        jest.spyOn(EditorContextModule, "useEditorContext").mockReturnValue(mockContext);
    });

    it("renders correctly", async () => {
        const { asFragment } = render(<ObjectButtonBar pid={pid} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("can refresh a list of children", async () => {
        render(<ObjectButtonBar pid={pid} />);
        const refreshIcon = screen.getByRole("button");
        expect(refreshIcon.textContent.trim()).toEqual("Refresh");
        await userEvent.setup().click(refreshIcon);
        await waitFor(() => expect(mockContext.action.clearPidFromChildListStorage).toHaveBeenCalledTimes(1));
        expect(mockContext.action.clearPidFromChildListStorage).toHaveBeenCalledWith(pid);
    });
});
