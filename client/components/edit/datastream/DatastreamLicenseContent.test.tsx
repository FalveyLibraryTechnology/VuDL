import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { act } from "react";
import DatastreamLicenseContent from "./DatastreamLicenseContent";
import userEvent from "@testing-library/user-event";

jest.mock("@mui/material/RadioGroup", () => () => "RadioGroup");
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
jest.mock("../../../hooks/useDatastreamOperation", () => () => {
    return mockUseDatastreamOperation();
});

describe("DatastreamLicenseContent", () => {
    let editorValues;
    let globalValues;
    let datastreamOperationValues;
    beforeEach(() => {
        editorValues = {
            state: {
                licensesCatalog: {
                    testLicenseKey: {
                        name: "testLicense",
                    },
                },
            },
        };
        globalValues = {
            action: {
                closeModal: jest.fn(),
            },
        };
        datastreamOperationValues = {
            uploadLicense: jest.fn(),
            getLicenseKey: jest.fn().mockResolvedValue("testLicenseKey"),
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseGlobalContext.mockReturnValue(globalValues);
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
    });

    it("renders", async () => {
        const { asFragment } = await act(async () => render(<DatastreamLicenseContent />));
        expect(asFragment()).toMatchSnapshot();
    });

    it("calls uploadLicense on click", async () => {
        datastreamOperationValues.uploadLicense.mockResolvedValue("upload worked");
        await act(async () => render(<DatastreamLicenseContent />));
        await userEvent.setup().click(screen.getByRole("button", { name: "Save" }));
        expect(datastreamOperationValues.getLicenseKey).toHaveBeenCalled();
        expect(datastreamOperationValues.uploadLicense).toHaveBeenCalled();
    });

    it("can be canceled", async () => {
        await act(async () => render(<DatastreamLicenseContent />));
        await userEvent.setup().click(screen.getByText("Cancel"));
        expect(datastreamOperationValues.uploadLicense).not.toHaveBeenCalled();
        expect(globalValues.action.closeModal).toHaveBeenCalledWith("datastream");
    });
});
