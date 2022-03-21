import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamUploadModalContent from "./DatastreamUploadModalContent";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
const mockUseFetchContext = jest.fn();
jest.mock("../../../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));
describe("DatastreamUploadModalContent", () => {
    let fetchValues;
    let editorValues;
    beforeEach(() => {
        fetchValues = {
            action: {
                fetchText: jest.fn(),
            },
        };
        editorValues = {
            action: {
                getCurrentModelsDatastreams: jest.fn().mockResolvedValue({}),
            },
            state: {
                currentPid: "vudl:123",
                activeDatastream: "THUMBNAIL",
                datastreamsCatalog: {
                    THUMBNAIL: {
                        mimetype: {
                            allowedType: "image",
                            allowedSubtypes: "png",
                        },
                    },
                },
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseFetchContext.mockReturnValue(fetchValues);
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamUploadModalContent />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders upload success", async () => {
        fetchValues.action.fetchText.mockResolvedValue("upload worked");
        const wrapper = mount(<DatastreamUploadModalContent />);
        await act(async () => {
            wrapper.find(".uploadFileButton").simulate("change", {
                target: {
                    files: [
                        {
                            type: "image/png",
                        },
                    ],
                },
            });
            wrapper.update();
        });

        expect(fetchValues.action.fetchText).toHaveBeenCalledWith(
            expect.stringContaining(editorValues.state.currentPid),
            expect.objectContaining({
                method: "POST",
                body: expect.any(FormData),
            })
        );
        expect(editorValues.action.getCurrentModelsDatastreams).toHaveBeenCalled();
        expect(wrapper.children().text()).toEqual("upload worked");
    });

    it("renders illegal mime type when type is invalid", async () => {
        const wrapper = mount(<DatastreamUploadModalContent />);
        await act(async () => {
            wrapper.find(".uploadFileButton").simulate("change", {
                target: {
                    files: [
                        {
                            type: "image/illegaltype",
                        },
                    ],
                },
            });
            wrapper.update();
        });

        expect(wrapper.children().text()).toContain("Illegal mime type");
    });

    it("renders illegal mime type when catalog cannot find datastream", async () => {
        editorValues.state.datastreamsCatalog = {};
        const wrapper = mount(<DatastreamUploadModalContent />);
        await act(async () => {
            wrapper.find(".uploadFileButton").simulate("change", {
                target: {
                    files: [
                        {
                            type: "image/png",
                        },
                    ],
                },
            });
            wrapper.update();
        });

        expect(wrapper.children().text()).toContain("Illegal mime type");
    });
});
