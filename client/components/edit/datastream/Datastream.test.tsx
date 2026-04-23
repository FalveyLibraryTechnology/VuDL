import { describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
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
            disabled: true,
        };
        const { asFragment } = render(<Datastream datastream={datastream} />);
        expect(asFragment()).toMatchSnapshot();
        expect(mockDatastreamControls).toHaveBeenCalled();
    });
});
