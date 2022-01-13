import React from "react";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render } from "enzyme";
import toJson from "enzyme-to-json";
import JobClickable from "./JobClickable";

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
        const wrapper = render(<JobClickable {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
