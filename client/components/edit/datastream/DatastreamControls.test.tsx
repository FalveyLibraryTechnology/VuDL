import React from "react";
import { describe, expect, it, jest } from "@jest/globals";
import { render } from "enzyme";
import toJson from "enzyme-to-json";
import { DatastreamModalStates } from "../../../context/EditorContext";
import DatastreamControls from "./DatastreamControls";

const mockDatastreamControlButton = jest.fn();
jest.mock("./DatastreamControlButton", () => (props) => {
    mockDatastreamControlButton(props);
    return "DatastreamControlButton";
});

describe("DatastreamControls", () => {
    it("renders", () => {
        const datastream = "test1";
        const wrapper = render(<DatastreamControls datastream={datastream} disabled={false} />);
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(mockDatastreamControlButton).toHaveBeenCalledWith({
            modalState: DatastreamModalStates.UPLOAD,
            datastream,
            disabled: false,
        });
    });
});
