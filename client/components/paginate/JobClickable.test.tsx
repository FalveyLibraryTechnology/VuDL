import { beforeEach, describe, expect, it } from "@jest/globals";
import JobClickable from "./JobClickable";
import { render } from "@testing-library/react";

describe("JobClickable", () => {
    let props;
    beforeEach(() => {
        props = {
            category: "testCategory",
            children: "testChildren",
            clickable: true,
            clickWarning: "testWarning",
        };
    });

    it("renders", () => {
        const { asFragment } = render(<JobClickable {...props} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
