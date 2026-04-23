import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import ObjectSummary from "./ObjectSummary";
import { updateRecentPidsCatalog } from "../../util/RecentPidsCatalog";
import { act } from "react";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("./CopyPidButton", () => () => "CopyPidButton");
jest.mock("./ObjectButtonBar", () => () => "ObjectButtonBar");
jest.mock("./ObjectChildCounts", () => () => "ObjectChildCounts");
jest.mock("./ObjectModels", () => () => "ObjectModels");
jest.mock("./ObjectOrder", () => () => "ObjectOrder");
jest.mock("./ObjectThumbnail", () => () => "ObjectThumbnail");
jest.mock("../../util/RecentPidsCatalog");

describe("ObjectSummary", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            state: {
                currentPid: "foo:123",
                objectDetailsStorage: {},
            },
            action: {
                extractFirstMetadataValue: jest.fn(),
                loadCurrentObjectDetails: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("displays loading message when appropriate", async () => {
        jest.spyOn(editorValues.action, "extractFirstMetadataValue").mockReturnValue("");
        const loadSpy = jest.spyOn(editorValues.action, "loadCurrentObjectDetails");
        let asFragment;
        await act(async () => {
            asFragment = render(<ObjectSummary />).asFragment;
        });
        expect(loadSpy).toHaveBeenCalledTimes(1);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders information from metadata when available", async () => {
        editorValues.state.objectDetailsStorage["foo:123"] = {
            metadata: {
                "dc:title": ["My title"],
                "dc:description": ["<p>Hello <b>world</b>!</p>"],
            },
        };
        const metaSpy = jest
            .spyOn(editorValues.action, "extractFirstMetadataValue")
            .mockReturnValueOnce("My title")
            .mockReturnValueOnce("<p>Hello <b>world</b>!</p>");
        let asFragment;
        await act(async () => {
            asFragment = render(<ObjectSummary />).asFragment;
        });
        expect(metaSpy).toHaveBeenCalledTimes(2);
        expect(metaSpy).toHaveBeenNthCalledWith(1, "dc:title", "Title not available");
        expect(metaSpy).toHaveBeenNthCalledWith(2, "dc:description", "");
        // Expected side-effect: register that PID has been recently viewed:
        expect(updateRecentPidsCatalog).toHaveBeenCalledWith("foo:123", "My title");
        expect(asFragment()).toMatchSnapshot();
    });
});
