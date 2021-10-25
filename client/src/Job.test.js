import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render } from "enzyme";
import toJson from "enzyme-to-json";
import { FetchContextProvider } from "./context";
import Job from "./Job";

const mockjobClickable = jest.fn();
jest.mock(
    "./JobClickable",
    () =>
        function JobClickable(props) {
            mockjobClickable(props);
            return <mock-JobClickable />;
        }
);

describe("Job", () => {
    let props;

    beforeEach(() => {
        props = {
            data: {
                category: "testCategory",
                children: "testChildren",
            },
        };
    });

    it("renders", () => {
        const wrapper = render(
            <FetchContextProvider>
                <Job {...props} />
            </FetchContextProvider>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
