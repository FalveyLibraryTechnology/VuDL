import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import renderer from "react-test-renderer";
import { act } from "react-dom/test-utils";
import DatastreamLicenseContent from "./DatastreamLicenseContent";

jest.mock("@mui/material/RadioGroup", () => () => "RadioGroup");
const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => {
    return mockUseDatastreamOperation();
});

describe("DatastreamLicenseContent", () => {
    let editorValues;
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
            action: {
                toggleDatastreamModal: jest.fn(),
            },
        };
        datastreamOperationValues = {
            uploadLicense: jest.fn(),
            getLicenseKey: jest.fn(),
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
    });

    it("renders", () => {
        const tree = renderer.create(<DatastreamLicenseContent />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("calls uploadLicense on click", async () => {
        datastreamOperationValues.uploadLicense.mockResolvedValue("upload worked");
        await act(async () => {
            await render(<DatastreamLicenseContent />);
            await fireEvent.click(screen.getByRole("button", { name: "Save" }));
        });
        expect(datastreamOperationValues.getLicenseKey).toHaveBeenCalled();
        expect(datastreamOperationValues.uploadLicense).toHaveBeenCalled();
    });
});
