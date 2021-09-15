import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow, render, mount } from "enzyme";
import toJson from "enzyme-to-json";
import ZoomToggleButton from "./ZoomToggleButton";

describe("ZoomToggleButton", () => {
    let props;

    beforeEach(() => {
        props = {
            paginator: {
                toggleZoom: jest.fn(),
                state: {
                    zoom: false,
                },
            },
        };
    });

    it("renders", () => {
        const wrapper = shallow(<ZoomToggleButton {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders correctly when zoom is off", () => {
        const wrapper = render(<ZoomToggleButton {...props} />);
        expect(wrapper.text().includes("Turn Zoom On")).toBeTruthy();
    });

    it("renders correctly when zoom is on", () => {
        props.paginator.state.zoom = true;
        const wrapper = render(<ZoomToggleButton {...props} />);
        expect(wrapper.text().includes("Turn Zoom Off")).toBeTruthy();
    });

    it("calls toggle zoom when button is clicked", () => {
        props.paginator.state.zoom = true;
        const wrapper = mount(<ZoomToggleButton {...props} />);

        expect(props.paginator.toggleZoom).not.toHaveBeenCalled();

        wrapper.find("button").simulate("click");

        expect(props.paginator.toggleZoom).toHaveBeenCalled();
    });
});
