import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { act } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DatastreamControlButton from "./DatastreamControlButton";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
const mockUseGlobalContext = jest.fn();
jest.mock("../../../context/GlobalContext", () => ({
    useGlobalContext: () => {
        return mockUseGlobalContext();
    },
}));
const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => mockUseDatastreamOperation());
describe("DatastreamControlButton", () => {
    let editorValues;
    let globalValues;
    let datastreamOperationValues;
    beforeEach(() => {
        editorValues = {
            action: {
                setActiveDatastream: jest.fn(),
                setDatastreamModalState: jest.fn(),
            },
        };
        globalValues = {
            action: {
                openModal: jest.fn(),
            },
        };
        datastreamOperationValues = {
            downloadDatastream: jest.fn(),
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseGlobalContext.mockReturnValue(globalValues);
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
    });

    it("renders", () => {
        const { asFragment } = render(<DatastreamControlButton modalState="Upload" datastream="THUMBNAIL" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("downloads the datastream", async () => {
        await act(async () => {
            render(<DatastreamControlButton modalState="Download" datastream="THUMBNAIL" />);
        });
        await userEvent.setup().click(screen.getByRole("button"));
        expect(datastreamOperationValues.downloadDatastream).toHaveBeenCalledWith("THUMBNAIL");
    });

    it("activates the modal", async () => {
        await act(async () => {
            render(<DatastreamControlButton modalState="View" datastream="THUMBNAIL" />);
        });
        await userEvent.setup().click(screen.getByRole("button"));
        expect(editorValues.action.setActiveDatastream).toHaveBeenCalledWith("THUMBNAIL");
        expect(editorValues.action.setDatastreamModalState).toHaveBeenCalledWith("View");
        expect(globalValues.action.openModal).toHaveBeenCalledWith("datastream");
    });
});
