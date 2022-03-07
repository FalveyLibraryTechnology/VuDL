import React from "react";
import { describe, expect, it, jest } from "@jest/globals";
import { render } from "enzyme";
import toJson from "enzyme-to-json";
import Datastream from "./Datastream";
const mockDatastreamControls = jest.fn();
jest.mock("./DatastreamControls", () => (props) => {
    mockDatastreamControls(props);
    return "DatastreamControls";
});

describe("Datastream", () => {
    it("renders", () => {
        const datastream = {
            stream: "test1",
        };
        const wrapper = render(<Datastream datastream={datastream} />);
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.text()).toContain(datastream.stream);
        expect(mockDatastreamControls).toHaveBeenCalled();
    });
});
