import { describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import { DatastreamModalStates } from "../../../context/EditorContext";
import DatastreamControls from "./DatastreamControls";

const mockDatastreamControlButton = jest.fn();
jest.mock("./DatastreamControlButton", () => (props) => {
    mockDatastreamControlButton(props);
    return "DatastreamControlButton: " + JSON.stringify(props);
});

describe("DatastreamControls", () => {
    it("renders", () => {
        const datastream = "test1";
        const { asFragment } = render(<DatastreamControls datastream={datastream} disabled={false} />);
        expect(asFragment()).toMatchSnapshot();
        expect(mockDatastreamControlButton).toHaveBeenCalledWith({
            modalState: DatastreamModalStates.UPLOAD,
            datastream,
            disabled: false,
        });
    });
});
