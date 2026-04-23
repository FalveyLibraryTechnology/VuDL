import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as EditorContextModule from "../../context/EditorContext";
import ObjectPreviewButton from "./ObjectPreviewButton";

describe("ObjectPreviewButton", () => {
    let pid: string;
    let mockContext;

    beforeEach(() => {
        pid = "foo:123";
        mockContext = {
            state: { vufindUrl: "" },
        };
        jest.spyOn(EditorContextModule, "useEditorContext").mockReturnValue(mockContext);
    });

    it("renders correctly without VuFind URL", async () => {
        render(<ObjectPreviewButton pid={pid} />);
        const previewButton = screen.queryByRole("button");
        expect(previewButton).toBeNull();
    });

    it("renders correctly with VuFind URL", async () => {
        mockContext.state.vufindUrl = "http://localhost";
        const { asFragment } = render(<ObjectPreviewButton pid={pid} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("can open a VuFind preview URL", async () => {
        mockContext.state.vufindUrl = "http://localhost";
        render(<ObjectPreviewButton pid={pid} />);
        const previewButton = screen.getByRole("button");
        expect(previewButton.textContent).toEqual("Preview");
        const openSpy = jest.spyOn(window, "open").mockImplementation(jest.fn());
        await userEvent.setup().click(previewButton);
        expect(openSpy).toHaveBeenCalledWith("http://localhost/Item/" + pid);
    });
});
