import { act } from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import DatastreamMetadataModalContent from "./DatastreamMetadataModalContent";

const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => mockUseDatastreamOperation());
const mockDatatypeContent = jest.fn();
jest.mock("../../shared/DatatypeContent", () => (props) => {
    mockDatatypeContent(props);
    return "DatatypeContent: " + JSON.stringify(props);
});
describe("DatastreamMetadataModalContent", () => {
    let datastreamOperationValues;
    let response;
    let data;
    let createObjectURL;
    beforeEach(() => {
        datastreamOperationValues = {
            viewMetadata: jest.fn(),
        };
        data = "test3";
        createObjectURL = jest.fn().mockReturnValue(data);
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
        Object.defineProperty(global, "URL", {
            value: {
                createObjectURL,
            },
            writable: true,
        });
    });

    it("renders", async () => {
        response = {
            data: "test1",
            mimeType: "test2",
        };
        datastreamOperationValues.viewMetadata.mockResolvedValue(response);
        let asFragment;
        await act(async () => {
            asFragment = render(<DatastreamMetadataModalContent />).asFragment;
        });
        expect(asFragment()).toMatchSnapshot();
        expect(mockDatatypeContent).toHaveBeenCalledWith(response);
    });
});
