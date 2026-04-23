import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import PaginatorPreview from "./PaginatorPreview";
import { act } from "react";

describe("PaginatorPreview", () => {
    let props;

    beforeEach(() => {
        props = {
            img: "testImage",
        };
    });

    it("renders", async () => {
        let container;
        await act(async () => {
            container = render(<PaginatorPreview {...props} />).container;
        });
        expect(container.innerHTML).toContain("preview-image");
        expect(container).toMatchSnapshot();
    });

    it("does not render image", async () => {
        props.img = "";
        let asFragment;
        await act(async () => {
            asFragment = render(<PaginatorPreview {...props} />).asFragment;
        });
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
        expect(asFragment).toMatchSnapshot();
    });
});
